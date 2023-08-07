
export default function PageInput(
  props: { lastPage: number; currentPage: number },
) {
  return (
    <input
      id="current_page"
      type="number"
      name="page"
      min="1"
      max={props.lastPage}
      value={props.currentPage}
      // @ts-ignore Property 'form' does exist on type 'EventTarget'.
      onChange={(event) => event.srcElement!.form.submit()}
    />
  );
}
