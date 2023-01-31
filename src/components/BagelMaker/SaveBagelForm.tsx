import type { FormEvent } from "react";
import { Button } from "../Button/Button";
import styles from "./BagelMaker.module.css";

export const Form = ({
  save,
}: {
  save: (event: FormEvent<HTMLFormElement>) => void;
}) => (
  <form className={styles.form} onSubmit={save}>
    <input
      className={styles.input}
      type="text"
      id="nameInput"
      required
      placeholder="Name your bagel"
    />
    <Button className={styles.button} submit>
      Save Bagel
    </Button>
  </form>
);
