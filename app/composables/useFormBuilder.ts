import type { FormContext, GenericObject, Path } from "vee-validate";
import { capitalize } from "~~/shared";

export const useFormBuilder = <
  T extends string,
  FormValues extends Record<string, unknown>,
>(
  form: FormContext<FormValues, GenericObject>,
  fields: T[],
  requiredFields?: T[],
): {
  fieldData: Record<T, ReturnType<typeof form.defineField>>;
  fieldValid: Record<T, ComputedRef<boolean>>;
  fieldErrors: ComputedRef<Partial<Record<T, string | undefined>>>;
  getFieldModel: (name: T) => ComputedRef<string>;
  getInvalidField: () => string;
  isFormValid: ComputedRef<boolean>;
} => {
  const fieldData = {} as Record<T, ReturnType<typeof form.defineField>>;
  const fieldValid = {} as Record<T, ComputedRef<boolean>>;

  for (const key of fields) {
    const field = form.defineField(key as unknown as Path<FormValues>, {
      validateOnModelUpdate: true,
      validateOnBlur: true,
    });

    fieldData[key] = field;

    fieldValid[key] = computed(() => {
      const hasError = form.errors.value[key as keyof typeof form.errors.value];
      const value = field[0]?.value;

      const isRequired = requiredFields?.includes(key);

      if (hasError) {
        return false;
      } else if (!isRequired) {
        return true;
      }

      switch (typeof value) {
        case null:
          return false;
        case "string":
          return String(value).trim().length > 0;
        case "number":
          return !isNaN(Number(value)) && Number(value) > 0;
        case "object":
          if (Array.isArray(value)) {
            return value.length > 0;
          }

          if (value && value.toString() !== "[object Object]") {
            return true;
          }

          break;
      }

      return Boolean(value);
    });
  }

  const fieldErrors = computed(
    () => form.errors.value as Partial<Record<T, string>>,
  );

  const isFormValid = computed(() => {
    return (
      form.meta.value?.valid && fields.every((key) => fieldValid[key].value)
    );
  });

  const getFieldModel = (name: (typeof fields)[number]) => {
    return computed({
      get: () => String(fieldData[name][0].value ?? ""),
      set: (val: string) => {
        fieldData[name][0].value = val;
      },
    });
  };

  const getInvalidField = () => {
    return fields
      .filter((f) => !fieldValid[f].value)
      .map((f) => capitalize(f))
      .join(", ");
  };

  return {
    fieldData,
    fieldValid,
    fieldErrors,
    isFormValid,
    getFieldModel,
    getInvalidField,
  };
};
