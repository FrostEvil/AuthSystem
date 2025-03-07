import { FormErrors } from "@/types/type";

export function addError(
  errors: FormErrors,
  field: keyof FormErrors,
  message: string
) {
  if (!errors[field]) {
    errors[field] = [];
  }
  errors[field]?.push(message);
}
