import { expect, test } from "bun:test";
import { formText } from "@/lib/form-text";

test("a text field's value is read", () => {
  const form = new FormData();
  form.set("name", "Acme");
  expect(formText(form, "name")).toBe("Acme");
});

test("a missing or file field is not text", () => {
  const form = new FormData();
  form.set("file", new File(["x"], "x.txt"));
  expect(() => formText(form, "missing")).toThrow();
  expect(() => formText(form, "file")).toThrow();
});
