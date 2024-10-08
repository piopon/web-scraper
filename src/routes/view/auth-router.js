import { AccessChecker } from "../../middleware/access-checker.js";
import { ComponentType } from "../../../config/app-types.js";
import { ScrapConfig } from "../../model/scrap-config.js";
import { ScrapUser } from "../../model/scrap-user.js";

import jwt from "jsonwebtoken";
import express from "express";
import bcrypt from "bcrypt";
import { MongooseError } from "mongoose";
import { Strategy } from "passport-local";

export class AuthRouter {
  static #ENCRYPT_SALT = 10;

  #components = undefined;
  #passport = undefined;

  /**
   * Creates a new auth router for managing user authentication and authorization
   * @param {Object} components The web components used in authentication process
   * @param {Object} passport The object controlling user sing-up and sing-in process
   */
  constructor(components, passport) {
    this.#components = components;
    this.#passport = passport;
    this.#configAuthentication(passport);
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
      })
    );
    router.get("/token", AccessChecker.canViewContent, (request, response) => {
      const token = jwt.sign(request.user.toJSON(), "your_jwt_secret");
      return response.status(200).json({token});
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
    const loginOptions = {
      successRedirect: "/",
      failureRedirect: "/auth/login",
      failureFlash: true,
    };
    const loginCallback = this.#passport.authenticate("local-login", loginOptions);
    const loginCallbackJwt = (req, res, next) => {
      this.#passport.authenticate("local-login", loginOptions, (err, user, info) => {
        const userJson = user.toJSON();
        if (err || !userJson) {
          return res.status(400).json({
            message: "Something is not right",
            user: userJson,
          });
        }
        req.login(userJson, loginOptions, (err) => {
          if (err) {
            res.send(err);
          }
          // generate a signed son web token with the contents of user object and return it in the response
          const token = jwt.sign(userJson, "your_jwt_secret");
          return res.json({ userJson, token });
        });
      })(req, res);
    };
    router.post("/login", AccessChecker.canViewSessionUser, loginCallback);
    // user content endpoints (log-out)
    const logoutCallback = (request, response, next) => {
      request.logout((err) => {
        if (err) return next(err);
        response.redirect("/auth/login");
      });
    };
    router.post("/logout", AccessChecker.canViewContent, logoutCallback);
  }

  /**
   * Method used to configure Passport authentication object
   * @param {Object} passport The auth object to be configured
   */
  #configAuthentication(passport) {
    // configure authenticate logic for specific endpoints
    this.#configLoginStategy(passport);
    this.#configRegisterStategy(passport);
    // configure common serialize and deserialize user logic
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });
    passport.deserializeUser(async (id, done) => {
      const user = await ScrapUser.getDatabaseModel().findById(id);
      done(null, user);
    });
  }

  /**
   * Method used to configurate user login strategy (currently only local login is possible)
   * @param {Object} passport The login auth and stategy object
   */
  #configLoginStategy(passport) {
    const options = { usernameField: "email", passwordField: "password" };
    const verify = async (email, password, done) => {
      try {
        // check if there is an user with provided email
        const user = await ScrapUser.getDatabaseModel().find({ email: email });
        if (user.length !== 1) {
          // did not find user with provided email - incorrect login data
          return done(null, false, { message: "Incorrect login data. Please try again." });
        }
        if (!(await bcrypt.compare(password, user[0].password))) {
          // provided password does not match the saved value - incorrect login data
          return done(null, false, { message: "Incorrect login data. Please try again." });
        }
        // login success - initialize auth components
        if (!(await this.#components.initComponents(ComponentType.AUTH, user[0]))) {
          return done(null, false, { message: "Cannot start authenticate components. Please try again." });
        }
        // updated user login date
        user[0].lastLogin = Date.now();
        await user[0].save();
        return done(null, user[0]);
      } catch (error) {
        let message = error.message;
        if (error instanceof MongooseError) {
          if (error.name === "MongooseError" && message.includes(".find()")) {
            message = "Database connection has timed out. Check connection status and please try again.";
          } else if (error.name === "ValidationError") {
            const invalidPath = Object.keys(error.errors);
            message = error.errors[invalidPath[0]].properties.message;
          }
        }
        if (message.includes("ECONNREFUSED")) {
          message = "Database connection has been broken. Check connection status and please try again.";
        }
        return done(null, false, { message: message });
      }
    };
    passport.use("local-login", new Strategy(options, verify));
  }

  /**
   * Method used to configurate user register strategy
   * @param {Object} passport The login auth and stategy object
   */
  #configRegisterStategy(passport) {
    const options = { usernameField: "email", passwordField: "password", passReqToCallback: true };
    const verify = async (request, username, password, done) => {
      try {
        // check if there isn't an user with provided email
        const user = await ScrapUser.getDatabaseModel().find({ email: username });
        if (user.length > 0) {
          // find existing user with provided email - incorrect reguster data
          return done(null, false, { message: "Provided email is already in use. Please try again." });
        }
        // create a new user with hashed password and add it to database
        const newUser = await ScrapUser.getDatabaseModel().create({
          name: request.body.name,
          email: username,
          password: await bcrypt.hash(password, AuthRouter.#ENCRYPT_SALT),
        });
        // user at this point has no config - we must create and link it
        const userConfig = await ScrapConfig.getDatabaseModel().create({ user: newUser._id });
        newUser.config = userConfig._id;
        await newUser.save();
        // return the newly created user with empty config
        return done(null, newUser);
      } catch (error) {
        let message = error.message;
        if (error instanceof MongooseError) {
          if (error.name === "MongooseError" && message.includes(".find()")) {
            message = "Database connection has timed out. Check connection status and please try again.";
          } else if (error.name === "ValidationError") {
            const invalidPath = Object.keys(error.errors);
            message = error.errors[invalidPath[0]].properties.message;
          }
        }
        if (message.includes("ECONNREFUSED")) {
          message = "Database connection has been broken. Check connection status and please try again.";
        }
        return done(null, false, { message: message });
      }
    };
    passport.use("local-register", new Strategy(options, verify));
  }
}
