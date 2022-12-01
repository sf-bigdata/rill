import { runtimeServiceGetCatalogEntry } from "@rilldata/web-common/runtime-client";
import { ExplorerMetricsDefinitionDoesntExist } from "@rilldata/web-local/common/errors/ErrorMessages";
import { fetchWrapperDirect } from "@rilldata/web-local/lib/util/fetchWrapper";
import { error, redirect } from "@sveltejs/kit";

export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  const localConfig = await fetchWrapperDirect(
    `${RILL_RUNTIME_URL}/local/config`,
    "GET"
  );

  try {
    const dashboardMeta = await runtimeServiceGetCatalogEntry(
      localConfig.instance_id,
      params.name
    );

    const dashboardYAML = dashboardMeta?.entry?.metricsView;

    // check if metrics definition is defined
    if (dashboardYAML) {
      return {
        metricViewName: params.name,
      };
    }
  } catch (err) {
    if (
      ExplorerMetricsDefinitionDoesntExist.includes(err.message) ||
      err.message.includes(ExplorerMetricsDefinitionDoesntExist)
    ) {
      throw error(404, "Dashboard not found");
    } else {
      throw redirect(307, `/dashboard/${params.name}/edit`);
    }
  }
  throw redirect(307, `/dashboard/${params.name}/edit`);
}