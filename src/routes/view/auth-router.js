import { AccessChecker } from "../../middleware/access-checker.js";
import { ScrapUser } from "../../model/scrap-user.js";

import jwt from "jsonwebtoken";
import express from "express";

export class AuthRouter {
  #passport = undefined;

  /**
   * Creates a new auth router for managing user authentication and authorization
   * @param {Object} passport The object controlling user sing-up and sing-in process
   */
  constructor(passport) {
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
      const token = jwt.sign(request.user.toJSON(), process.env.JWT_SECRET);
      return response.status(200).json({ token });
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
    // demo functionality login
    const demoCallback = this.#passport.authenticate("local-demo", {
      successRedirect: "/",
      failureRedirect: "/auth/login",
      failureFlash: true,
    });
    router.post("/demo", AccessChecker.canViewSessionUser, demoCallback);
    // user content endpoints (log-out)
    const logoutCallback = (request, response, next) => {
      const temporaryEmail = request.user.hostUser ? request.user.email : undefined;
      request.logout(async (err) => {
        if (err) return next(err);
        response.redirect("/auth/login");
        if (temporaryEmail) {
          await ScrapUser.getDatabaseModel().deleteOne({ email: temporaryEmail });
        }
      });
    };
    router.post("/logout", AccessChecker.canViewContent, logoutCallback);
  }
}
