import { Handlers, PageProps } from "$fresh/server.ts";
import { AdminState } from "@/utils/adminAccessHandler.ts";
import { AllTimeMetric, getManyMetricsForAllTime } from "@/utils/db.ts";

interface Props extends AdminState {
  developersCount: bigint;
  employersCount: bigint;
}

export const handler: Handlers<Props, AdminState> = {
  async GET(_, ctx) {
    const [developersCount, employersCount] = await getManyMetricsForAllTime([
      AllTimeMetric.DevelopersCreatedCount,
      AllTimeMetric.EmployersCreatedCount,
    ]);
    return ctx.render({ ...ctx.state, developersCount, employersCount });
  },
};

export default function AdminHomePage(props: PageProps<Props>) {
  const { developersCount, employersCount } = props.data;
  return (
    <main>
      <h1>Welcome Admin!</h1>

      <dl>
        <dt>Developers</dt>
        <dd>{developersCount}</dd>

        <dt>Employers</dt>
        <dd>{employersCount}</dd>
      </dl>

      <ul>
        <li>
          <a href="/admin/emailTemplates">Email Templates</a>
        </li>
      </ul>
    </main>
  );
}
