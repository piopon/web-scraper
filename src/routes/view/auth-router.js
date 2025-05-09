import { AccessChecker } from "../../middleware/access-checker.js";
import { ComponentType } from "../../config/app-types.js";
import { ScrapConfig } from "../../model/scrap-config.js";
import { ScrapUser } from "../../model/scrap-user.js";

import jwt from "jsonwebtoken";
import express from "express";

export class AuthRouter {
  #components = undefined;
  #passport = undefined;

  /**
   * Creates a new auth router for managing user authentication and authorization
   * @param {Object} passport The object controlling user sing-up and sing-in process
   */
  constructor(passport, components) {
    this.#components = components;
    this.#passport = passport;
  }

  /**
   * Method used to create routes for view endpoints
   * @returns router object for handling view requests
   */
  createRoutes() {
    const router = express.Router();
    this.#createGetRoutes(router);
    this.#createPostRoutes(router);

    return router;
  }

  /**
   * Method used to create GET method routes and add them to the router object
   * @param {Object} router The router object with GET method routes defined
   */
  #createGetRoutes(router) {
    router.get("/register", AccessChecker.canViewSessionUser, (request, response) =>
      response.render("register", {
        title: "scraper user registration",
        type: "register",
      })
    );
    router.get("/login", AccessChecker.canViewSessionUser, (request, response) =>
      response.render("login", {
        title: "scraper user login",
        type: "login",
        demo: {
          user: process.env.DEMO_USER,
          pass: process.env.DEMO_PASS,
        },
      })
    );
    router.get("/token", AccessChecker.canViewContent, (request, response) => {
      const storedUser = request.user.toJSON();
      const signedData = { name: storedUser.name, email: storedUser.email, password: storedUser.password };
      const token = jwt.sign(signedData, process.env.JWT_SECRET);
      return response.status(200).json({ token });
    });
    const googleLogin = this.#passport.authenticate("google", { scope: ["email", "profile"] });
    router.get("/google", AccessChecker.canViewSessionUser, googleLogin);
    const googleCallback = this.#passport.authenticate("google", { failureRedirect: "/auth/login" });
    router.get("/google/callback", AccessChecker.canViewSessionUser, googleCallback, (_, response) => {
      response.redirect("/");
    });
  }

  /**
   * Method used to create POST method routes and add them to the router object
   * @param {Object} router The router object with POST method routes defined
   */
  #createPostRoutes(router) {
    // user sessions endpoints (sign-in and log-in)
    const registerCallback = this.#passport.authenticate("local-register", {
      successRedirect: "/auth/login",
      failureRedirect: "/auth/register",
      failureFlash: true,
      session: false,
    });
    router.post("/register", AccessChecker.canViewSessionUser, registerCallback);
    const loginCallback = this.#passport.authenticate("local-login", {
      successRedirect: "/",
      failureRedirect: "/auth/login",
      failureFlash: true,
    });
    router.post("/login", AccessChecker.canViewSessionUser, loginCallback);
    // remote JWT token retrieval
    router.post("/token", AccessChecker.canViewSessionUser, (request, response, next) => {
      this.#passport.authenticate("local-login", { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
          return response.status(400).json({ error: info.message || "Token retrieval error" });
        }
        const signedData = { name: user.name, email: user.email, password: user.password };
        const token = jwt.sign(signedData, process.env.JWT_SECRET);
        return response.status(200).json({ token });
      })(request, response, next);
    });
    // demo functionality login
    const demoCallback = this.#passport.authenticate("local-demo", {
      successRedirect: "/",
      failureRedirect: "/auth/login",
      failureFlash: true,
    });
    router.post("/demo", AccessChecker.canViewSessionUser, demoCallback);
    // user content endpoints (log-out)
    const logoutCallback = (request, response, next) => {
      const temporaryUser = request.user.hostUser ? request.user : undefined;
      request.logout(async (err) => {
        if (err) return next(err);
        response.redirect("/auth/login");
        if (temporaryUser) {
          await ScrapUser.getDatabaseModel().deleteOne({ email: temporaryUser.email });
          await ScrapConfig.getDatabaseModel().deleteOne({ user: temporaryUser._id });
          // we should stop logout action components and clean their temporary data
          this.#components.runComponents(ComponentType.LOGOUT, "stop", temporaryUser.email, "Demo session ended.");
          this.#components.runComponents(ComponentType.LOGOUT, "clean", temporaryUser.email);
        }
      });
    };
    router.post("/logout", AccessChecker.canViewContent, logoutCallback);
  }
}
