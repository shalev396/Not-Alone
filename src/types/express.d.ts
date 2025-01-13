import { Express } from "express";
import { Server } from "http";

declare module "express-serve-static-core" {
  interface Express {
    listening?: boolean;
    close?: (callback?: (err?: Error) => void) => Server;
  }
}

export {};
