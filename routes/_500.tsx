import { ErrorPageProps } from "$fresh/server.ts";

export default function Error500Page(props: ErrorPageProps) {
  return (
    <main>
      <h1>Server error</h1>
      <p>500 internal error: {(props.error as Error).message}</p>
      <p>
        <a href="/">Return home</a>
      </p>
    </main>
  );
}
