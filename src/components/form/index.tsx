import {
  Button,
  Flex,
  Input,
  Select,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import {
  FormProvider,
  useForm,
  get,
  useFormContext,
  SubmitHandler,
} from "react-hook-form";

type FormType = {
  phone: string;
  name: string;
  address: string;
  office: string;
};

const getInitialValue = () => {
  try {
    return JSON.parse(localStorage.getItem("user") ?? "");
  } catch {
    return {};
  }
};
const Field: React.FC<{
  id: string;
  name: string;
  label: string;
  children: ReactNode;
}> = ({ children, id, name, label }) => {
  const {
    formState: { errors },
  } = useFormContext();
  const error = get(errors, name);
  return (
    <Flex direction={"column"} w="100%">
      <Flex as={"label"} htmlFor={id} py={1} mb={1} fontWeight={"bold"}>
        {label}
      </Flex>
      <Flex>{children}</Flex>
      {error && error.message && <Flex color={"red.500"}>{error.message}</Flex>}
    </Flex>
  );
};
export const UserDetails: React.FC<{ onSubmit: (v: FormType) => void }> = ({
  onSubmit,
}) => {
  const methods = useForm<FormType>({
    mode: "all",
    reValidateMode: "onSubmit",
    shouldFocusError: true,
    defaultValues: getInitialValue(),
  });

  const handleSubmit: SubmitHandler<FormType> = (values) => {
    if (onSubmit && "function" === typeof onSubmit) {
      const { name, phone } = values;
      localStorage.setItem("user", JSON.stringify({ name, phone }));
      onSubmit(values);
    }
  };
  return (
    <FormProvider {...methods}>
      <VStack
        as={"form"}
        gap={15}
        onSubmit={methods.handleSubmit(handleSubmit)}
      >
        <Field name="name" id="name" label="Name">
          <Input
            id="name"
            placeholder="Name"
            {...methods.register("name", {
              required: "Name is required",
            })}
          />
        </Field>
        <Field name="phone" id="phone" label="Phone">
          <Input
            id="phone"
            placeholder="Phone number"
            {...methods.register("phone", {
              required: "Phone is required",
            })}
          />
        </Field>

        <Field name="office" id="office" label="Office">
          <Select
            bg="#101010"
            borderRadius={5}
            id="office"
            h={"60px"}
            border={"none"}
            {...methods.register("office", {
              required: "Office is required",
            })}
            placeholder="Office"
          >
            {[
              "City",
              "Kilbirnie",
              "Khandallah",
              "Karori",
              "Johnsonville",
              "Lower Hutt",
              "Upper Hutt",
              "Masterton",
            ].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          name="address"
          label="Address of the property being listed"
          id="address"
        >
          <Textarea
            p={8}
            {...methods.register("address", {
              required: "Address is required",
            })}
            placeholder="Address"
            id="address"
            minH={200}
          />
        </Field>
        <Flex w="full" mt={3}>
          <Button size={"lg"} w="100%" colorScheme="green" type="submit">
            Next
          </Button>
        </Flex>
      </VStack>
    </FormProvider>
  );
};
