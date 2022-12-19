import {
  useRuntimeServiceEstimateRollupInterval,
  useRuntimeServiceEstimateSmallestTimeGrain,
  useRuntimeServiceGenerateTimeSeries,
  useRuntimeServiceGetCardinalityOfColumn,
  useRuntimeServiceGetNullCount,
  useRuntimeServiceGetNumericHistogram,
  useRuntimeServiceGetRugHistogram,
  useRuntimeServiceGetTableCardinality,
  useRuntimeServiceGetTopK,
} from "@rilldata/web-common/runtime-client";
import { getPriorityForColumn } from "@rilldata/web-local/lib/http-request-queue/priorities";
import { derived, writable } from "svelte/store";
import { convertTimestampPreview } from "../../util/convertTimestampPreview";

/** for each entry in a profile column results, return the null count and the column cardinality */
export function getSummaries(objectName, instanceId, profileColumnResults) {
  if (!profileColumnResults && !profileColumnResults?.length) return;
  return derived(
    profileColumnResults.map((column) => {
      return derived(
        [
          writable(column),
          useRuntimeServiceGetNullCount(
            instanceId,
            objectName,
            { columnName: column.name },
            {
              query: { keepPreviousData: true },
            }
          ),
          useRuntimeServiceGetCardinalityOfColumn(
            instanceId,
            objectName,
            { columnName: column.name },
            { query: { keepPreviousData: true } }
          ),
        ],
        ([col, nullValues, cardinality]) => {
          return {
            ...col,
            nullCount: +nullValues?.data?.count,
            cardinality: +cardinality?.data?.categoricalSummary?.cardinality,
          };
        }
      );
    }),

    (combos) => {
      return combos;
    }
  );
}

export function getNullPercentage(instanceId, objectName, columnName) {
  const nullQuery = useRuntimeServiceGetNullCount(instanceId, objectName, {
    columnName,
  });
  const totalRowsQuery = useRuntimeServiceGetTableCardinality(
    instanceId,
    objectName
  );
  return derived([nullQuery, totalRowsQuery], ([nulls, totalRows]) => {
    return {
      nullCount: nulls?.data?.count,
      totalRows: +totalRows?.data?.cardinality,
    };
  });
}

export function getCountDistinct(instanceId, objectName, columnName) {
  const cardinalityQuery = useRuntimeServiceGetCardinalityOfColumn(
    instanceId,
    objectName,
    { columnName }
  );

  const totalRowsQuery = useRuntimeServiceGetTableCardinality(
    instanceId,
    objectName
  );

  return derived(
    [cardinalityQuery, totalRowsQuery],
    ([cardinality, totalRows]) => {
      return {
        cardinality: cardinality?.data?.categoricalSummary?.cardinality,
        totalRows: +totalRows?.data?.cardinality,
      };
    }
  );
}

export function getTopK(instanceId, objectName, columnName, active = false) {
  const topKQuery = useRuntimeServiceGetTopK(instanceId, objectName, {
    columnName: columnName,
    agg: "count(*)",
    k: 75,
    priority: getPriorityForColumn("topk", active),
  });
  return derived(topKQuery, ($topKQuery) => {
    return $topKQuery?.data?.categoricalSummary?.topK?.entries;
  });
}

export function getTimeSeriesAndSpark(
  instanceId,
  objectName,
  columnName,
  active = false
) {
  const query = useRuntimeServiceGenerateTimeSeries(
    instanceId,
    objectName,
    // FIXME: convert pixel back to number once the API
    {
      timestampColumnName: columnName,
      pixels: 92,
      priority: getPriorityForColumn("timeseries", active),
    }
  );
  const estimatedInterval = useRuntimeServiceEstimateRollupInterval(
    instanceId,
    objectName,
    { columnName, priority: getPriorityForColumn("rollup-interval", active) }
  );

  const smallestTimeGrain = useRuntimeServiceEstimateSmallestTimeGrain(
    instanceId,
    objectName,
    {
      columnName,
      priority: getPriorityForColumn("smallest-time-grain", active),
    }
  );

  return derived(
    [query, estimatedInterval, smallestTimeGrain],
    ([$query, $estimatedInterval, $smallestTimeGrain]) => {
      return {
        estimatedRollupInterval: $estimatedInterval?.data,
        smallestTimegrain: $smallestTimeGrain?.data?.timeGrain,
        data: convertTimestampPreview(
          $query?.data?.rollup?.results?.map((di) => {
            const next = { ...di, count: di.records.count };
            return next;
          }) || [],
          "ts"
        ),
        spark: convertTimestampPreview(
          $query?.data?.rollup?.spark?.map((di) => {
            const next = { ...di, count: di.records.count };
            return next;
          }) || [],
          "ts"
        ),
      };
    }
  );
}

export function getNumericHistogram(
  instanceId,
  objectName,
  columnName,
  active = false
) {
  const histogramQuery = useRuntimeServiceGetNumericHistogram(
    instanceId,
    objectName,
    { columnName, priority: getPriorityForColumn("numeric-histogram", active) }
  );
  return derived(histogramQuery, ($query) => {
    return $query?.data?.numericSummary?.numericHistogramBins?.bins;
  });
}

export function getRugPlotData(
  instanceId,
  objectName,
  columnName,
  active = false
) {
  const outliersQuery = useRuntimeServiceGetRugHistogram(
    instanceId,
    objectName,
    { columnName, priority: getPriorityForColumn("rug-histogram", active) }
  );
  return derived(outliersQuery, ($query) => {
    return $query?.data?.numericSummary?.numericOutliers?.outliers;
  });
}
