import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartData[];
  title?: string;
  height?: number | string;
  width?: number | string;
  showTooltip?: boolean;
  tooltipFormatter?: (params: any) => string;
  showLabels?: boolean;
  labelFormatter?: string;
  radius?: string;
  center?: [string, string];
  noDataMessage?: string;
  className?: string;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 200,
  width = "100%",
  showTooltip = true,
  tooltipFormatter,
  showLabels = true,
  labelFormatter = "{b}",
  radius = "70%",
  center = ["50%", "55%"],
  noDataMessage = "No Data Available",
  className = "",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    // Filter out zero values
    const filteredData = data?.filter((item) => item?.value > 0);

    const option = {
      title: {
        text: filteredData?.length === 0 ? noDataMessage : title,
        left: "center",
        top: filteredData?.length === 0 ? "center" : "10px",
        textStyle: {
          color: filteredData?.length === 0 ? "#6B7280" : "#374151",
          fontFamily: "Roboto, sans-serif",
          fontSize: 16,
          fontWeight: "semibold",
        },
      },
      tooltip: showTooltip
        ? {
            trigger: "item",
            formatter:
              tooltipFormatter ||
              ((params: any) => {
                const name = params.name;
                const value = params.value;
                const percentage = params.percent;
                return `${name}: ${value.toFixed(1)} Ltr (${percentage}%)`;
              }),
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderColor: "#ccc",
            borderWidth: 1,
            textStyle: {
              color: "#fff",
              fontSize: 12,
            },
            position: function (
              point: number[],
              _params: any,
              _dom: HTMLElement,
              _rect: any,
              size: any
            ) {
              const chartContainer = chartRef.current;
              if (!chartContainer) return [point[0] + 10, point[1] - 10];

              const containerRect = chartContainer.getBoundingClientRect();
              const tooltipWidth = size.contentSize[0];
              const tooltipHeight = size.contentSize[1];

              let x = point[0] + 10;
              let y = point[1] - 10;

              if (x + tooltipWidth > containerRect.width) {
                x = point[0] - tooltipWidth - 10;
              }

              if (y < 0) {
                y = point[1] + 10;
              }
              if (y + tooltipHeight > containerRect.height) {
                y = containerRect.height - tooltipHeight - 10;
              }

              return [x, y];
            },
            confine: true,
            extraCssText: "z-index: 9; max-width: none; white-space: nowrap;",
          }
        : undefined,
      series:
        filteredData?.length && filteredData?.length > 0
          ? [
              {
                name: title || "Chart",
                type: "pie",
                radius: radius,
                center: center,
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 0,
                  borderColor: "#3b82f6",
                  borderWidth: 1,
                },
                label: showLabels
                  ? {
                      show: false,
                      position: "outside",
                      formatter: labelFormatter,
                      fontSize: 14,
                      color: "#374151",
                      fontWeight: "normal",
                      distance: 15,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderColor: "#ccc",
                      borderWidth: 0,
                      borderRadius: 0,
                      padding: [4, 8],
                    }
                  : {
                      show: false,
                    },
                emphasis: {
                  label: {
                    show: false,
                    fontSize: 14,
                    fontWeight: "semibold",
                  },
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)",
                  },
                },
                labelLine: showLabels
                  ? {
                      show: false,
                      length: 15,
                      length2: 10,
                      lineStyle: {
                        color: "#999",
                        width: 1,
                      },
                    }
                  : {
                      show: false,
                    },
                data: filteredData.map((item) => ({
                  name: item.name,
                  value: item.value,
                  itemStyle: {
                    color: item.color,
                  },
                })),
              },
            ]
          : [],
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [
    data,
    title,
    height,
    width,
    showTooltip,
    tooltipFormatter,
    showLabels,
    labelFormatter,
    radius,
    center,
    noDataMessage,
  ]);

  return <div ref={chartRef} style={{ height, width }} className={className} />;
};

export default PieChart;
