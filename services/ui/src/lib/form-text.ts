import { z } from "zod";

const text = z.string(); // every field of our forms is a text input

/** The text of a form's field; a field that is not text throws. */
export function formText(form: FormData, name: string): string {
  return text.parse(form.get(name));
}
