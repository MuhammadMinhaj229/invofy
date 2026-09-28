import { z } from "zod";
import { InvoiceSchema } from "./lib/schemas";
import { FORM_DEFAULT_VALUES } from "./lib/variables";

const formValues = FORM_DEFAULT_VALUES;
const parsed = InvoiceSchema.safeParse(formValues);
console.log(parsed.success ? "Success" : JSON.stringify(parsed.error.issues, null, 2));
