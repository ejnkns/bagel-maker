import type { FormEvent } from "react";
import { Button } from "../Button/Button";

export const Form = ({
  save,
}: {
  save: (event: FormEvent<HTMLFormElement>) => void;
}) => (
  <form onSubmit={save}>
    <input type="text" id="nameInput" required placeholder="Name your bagel" />
    <Button submit>Save Bagel</Button>
  </form>
);
