import { computed, nextTick, onActivated, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { getInstanceByDom, init, use } from 'echarts/core';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';

use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

export function useEcharts(container: Ref<HTMLElement | null>, option: ComputedRef<EChartsCoreOption>) {
  const chart = shallowRef<EChartsType | null>(null);
  const isReady = computed(() => Boolean(chart.value));

  let resizeObserver: ResizeObserver | null = null;
  let resizeFrame = 0;

  function hasSize(element: HTMLElement) {
    return element.clientWidth > 0 && element.clientHeight > 0;
  }

  function ensureChart() {
    const element = container.value;
    if (!element || !hasSize(element)) return null;

    chart.value = getInstanceByDom(element) || init(element, undefined, { renderer: 'canvas' });
    chart.value.setOption(option.value, { lazyUpdate: true, notMerge: true });

    return chart.value;
  }

  function resizeChart() {
    const element = container.value;
    if (!element || !hasSize(element)) return;

    const instance = chart.value || ensureChart();
    instance?.resize();
  }

  function scheduleResize() {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      resizeChart();
    });
  }

  function startObserving() {
    const element = container.value;
    if (!element) return;

    ensureChart();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', scheduleResize);
      return;
    }

    resizeObserver = new ResizeObserver(scheduleResize);
    resizeObserver.observe(element);
  }

  function disposeChart() {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = 0;
    resizeObserver?.disconnect();
    resizeObserver = null;
    window.removeEventListener('resize', scheduleResize);
    chart.value?.dispose();
    chart.value = null;
  }

  watch(
    option,
    value => {
      if (chart.value) {
        chart.value.setOption(value, { lazyUpdate: true, notMerge: true });
      } else {
        ensureChart();
      }
    },
    { deep: true }
  );

  onMounted(async () => {
    await nextTick();
    startObserving();
  });

  onActivated(async () => {
    await nextTick();
    scheduleResize();
  });

  onBeforeUnmount(disposeChart);

  return {
    chart,
    isReady,
    resizeChart
  };
}
