import { describe, it, expect } from "vitest";
import { canAccess } from "./permissions";

describe("canAccess", () => {
  it("allows the owner", () => {
    expect(canAccess("alice", "alice", [])).toBe(true);
  });

  it("allows a user the document was shared with", () => {
    expect(canAccess("alice", "bob", ["bob"])).toBe(true);
  });

  it("blocks a stranger", () => {
    expect(canAccess("alice", "carol", ["bob"])).toBe(false);
  });

  it("blocks everyone except the owner when nothing is shared", () => {
    expect(canAccess("alice", "bob", [])).toBe(false);
  });
});