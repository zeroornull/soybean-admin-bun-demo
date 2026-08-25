<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NAlert, NButton, NCard, NDatePicker, NProgress } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import type { EChartsCoreOption } from 'echarts/core';
import { useEcharts } from '@/composables/use-echarts';
import { dayjs } from '@/locales/dayjs';
import { fetchDashboardServiceStatus, fetchOtherServiceStatus, fetchProtectedServiceStatus } from '@/service/api';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import { setAccessToken } from '@/utils/storage';

defineOptions({ name: 'Home' });

const reportDate = ref<number | null>(dayjs('2026-08-24').valueOf());
const refreshCount = ref(0);
const serviceState = ref<'loading' | 'success' | 'error'>('loading');
const serviceName = ref('');
const otherServiceState = ref<'loading' | 'success' | 'error'>('loading');
const otherServiceName = ref('');
const datePickerRef = ref<InstanceType<typeof NDatePicker> | null>(null);
const trafficChartRef = ref<HTMLElement | null>(null);
const { t, locale } = useI18n();
const themeStore = useThemeStore();
const appStore = useAppStore();
const authStore = useAuthStore();
const numberFormatter = computed(() => new Intl.NumberFormat(locale.value));
const currencyFormatter = computed(
  () => new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 })
);
const localizedDate = computed(() => {
  const dayjsLocale = locale.value === 'zh-CN' ? 'zh-cn' : 'en';
  return dayjs(reportDate.value || undefined)
    .locale(dayjsLocale)
    .format('YYYY MMMM D, dddd');
});
const dashboardStats = computed(() => [
  { key: 'visits', label: t('dashboard.totalVisits'), value: numberFormatter.value.format(128_430), trend: '+12.5%' },
  { key: 'orders', label: t('dashboard.orders'), value: numberFormatter.value.format(3_842), trend: '+8.2%' },
  { key: 'conversion', label: t('dashboard.conversionRate'), value: '3.2%', trend: '+0.4%' },
  { key: 'revenue', label: t('dashboard.revenue'), value: currencyFormatter.value.format(286_540), trend: '+15.8%' }
]);
const channelShares = computed(() => [
  { key: 'organic', label: t('dashboard.organicSearch'), value: 42 },
  { key: 'social', label: t('dashboard.socialMedia'), value: 27 },
  { key: 'direct', label: t('dashboard.directVisit'), value: 19 },
  { key: 'email', label: t('dashboard.emailCampaign'), value: 12 }
]);
const chartTokens = computed(() =>
  themeStore.darkMode
    ? {
        text: '#e5e7eb',
        muted: '#9ca3af',
        axis: '#4b5563',
        tooltipBackground: '#1f2937'
      }
    : {
        text: '#334155',
        muted: '#64748b',
        axis: '#dbe2ea',
        tooltipBackground: '#ffffff'
      }
);
const trafficOption = computed<EChartsCoreOption>(() => {
  const tokens = chartTokens.value;
  const primary = themeStore.themeColorPalette;
  const days = [
    t('dashboard.monday'),
    t('dashboard.tuesday'),
    t('dashboard.wednesday'),
    t('dashboard.thursday'),
    t('dashboard.friday'),
    t('dashboard.saturday'),
    t('dashboard.sunday')
  ];

  return {
    animationDuration: 450,
    color: [primary.primaryColor, primary.primaryColorHover],
    grid: { top: 48, right: 54, bottom: 34, left: 58 },
    legend: {
      top: 4,
      data: [t('dashboard.visits'), t('dashboard.orderSeries')],
      textStyle: { color: tokens.text }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: tokens.tooltipBackground,
      borderColor: tokens.axis,
      textStyle: { color: tokens.text }
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: days,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: tokens.axis } },
      axisLabel: { color: tokens.muted }
    },
    yAxis: [
      {
        type: 'value',
        name: t('dashboard.visitsUnit'),
        nameTextStyle: { color: tokens.muted },
        axisLabel: { color: tokens.muted },
        splitLine: { lineStyle: { color: tokens.axis, opacity: 0.55 } }
      },
      {
        type: 'value',
        name: t('dashboard.ordersUnit'),
        nameTextStyle: { color: tokens.muted },
        axisLabel: { color: tokens.muted },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: t('dashboard.visits'),
        type: 'line',
        smooth: true,
        symbolSize: 7,
        lineStyle: { width: 3 },
        areaStyle: { color: primary.primaryColorSuppl, opacity: 0.16 },
        data: [18_200, 23_400, 21_500, 27_800, 32_600, 30_100, 38_900]
      },
      {
        name: t('dashboard.orderSeries'),
        type: 'bar',
        yAxisIndex: 1,
        barMaxWidth: 22,
        itemStyle: { borderRadius: [5, 5, 0, 0], opacity: 0.78 },
        data: [520, 680, 610, 790, 910, 860, 1_120]
      }
    ],
    media: [
      {
        query: { maxWidth: 420 },
        option: {
          grid: { top: 52, right: 38, bottom: 34, left: 46 },
          xAxis: { axisLabel: { interval: 1 } },
          yAxis: [{ name: '' }, { name: '' }]
        }
      }
    ]
  };
});
const { chart, isReady } = useEcharts(trafficChartRef, trafficOption);

async function loadServiceStatus(simulateError = false) {
  if (serviceState.value === 'loading' && simulateError) return;

  serviceState.value = 'loading';
  const { data, error } = await fetchDashboardServiceStatus(simulateError);

  if (error) {
    serviceState.value = 'error';
    return;
  }

  serviceName.value = data.service;
  serviceState.value = 'success';
}

async function loadOtherServiceStatus() {
  otherServiceState.value = 'loading';
  const { data, error } = await fetchOtherServiceStatus();

  if (error || !data) {
    otherServiceState.value = 'error';
    return;
  }

  otherServiceName.value = data.service;
  otherServiceState.value = 'success';
}

async function simulateExpiredToken() {
  authStore.token = 'mock-expired-access-token';
  setAccessToken('mock-expired-access-token');
  serviceState.value = 'loading';

  const { data, error } = await fetchProtectedServiceStatus();

  if (error) {
    serviceState.value = 'error';
    return;
  }

  serviceName.value = data.service;
  serviceState.value = 'success';
}

onMounted(() => {
  const input = (datePickerRef.value?.$el as HTMLElement | undefined)?.querySelector('input');
  input?.setAttribute('id', 'dashboard-report-date');
  input?.setAttribute('name', 'reportDate');
  void loadServiceStatus();
  void loadOtherServiceStatus();
});
</script>

<template>
  <div data-page="home" class="mx-auto min-h-full w-full max-w-1680px">
    <header class="flex flex-col gap-18px lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="m-0 text-28px font-700">{{ t('dashboard.title') }}</h1>
        <p class="mb-0 mt-6px text-14px opacity-68">{{ t('dashboard.subtitle') }}</p>
        <p data-dayjs-locale class="mb-0 mt-6px text-12px opacity-58">{{ localizedDate }}</p>
      </div>

      <div class="flex flex-col gap-10px sm:flex-row sm:items-end">
        <label class="flex min-w-0 flex-col gap-5px text-12px sm:w-190px">
          <span>{{ t('dashboard.reportDate') }}</span>
          <NDatePicker ref="datePickerRef" v-model:value="reportDate" data-naive-locale-demo type="date" clearable />
        </label>
        <NButton data-local-counter="home" data-naive-primary type="primary" @click="refreshCount += 1">
          {{ t('dashboard.refreshData', { count: refreshCount }) }}
        </NButton>
      </div>
    </header>

    <section data-dashboard-boundary :data-state="serviceState" class="mt-14px">
      <NAlert v-if="serviceState === 'loading'" type="info">
        {{ t('dashboard.loadingService') }}
      </NAlert>
      <NAlert
        v-else-if="serviceState === 'error'"
        data-dashboard-error
        :title="t('dashboard.serviceUnavailable')"
        type="error"
        role="alert"
      >
        <p class="m-0">{{ t('dashboard.serviceErrorDescription') }}</p>
        <NButton
          data-dashboard-action="retry"
          class="mt-10px"
          size="small"
          type="primary"
          @click="loadServiceStatus(false)"
        >
          {{ t('common.retry') }}
        </NButton>
      </NAlert>
      <div
        v-else
        class="flex flex-wrap items-center justify-between gap-8px rd-8px border border-[var(--border-color)] bg-[var(--card-bg)] px-12px py-9px text-12px"
      >
        <span data-dashboard-service-ready>
          {{ t('dashboard.serviceReady', { service: serviceName }) }}
        </span>
        <NButton data-dashboard-action="simulate-error" size="tiny" tertiary @click="loadServiceStatus(true)">
          {{ t('dashboard.simulateServiceError') }}
        </NButton>
        <NButton data-dashboard-action="simulate-expired-token" size="tiny" tertiary @click="simulateExpiredToken">
          {{ t('dashboard.simulateExpiredToken') }}
        </NButton>
      </div>
    </section>

    <section
      data-other-service
      :data-state="otherServiceState"
      class="mt-10px flex flex-wrap items-center justify-between gap-8px rd-8px border border-[var(--border-color)] bg-[var(--card-bg)] px-12px py-9px text-12px"
    >
      <span v-if="otherServiceState === 'success'" data-other-service-ready>
        {{ t('dashboard.otherServiceReady', { service: otherServiceName }) }}
      </span>
      <span v-else-if="otherServiceState === 'error'" data-other-service-error>
        {{ t('dashboard.otherServiceUnavailable') }}
      </span>
      <span v-else>{{ t('dashboard.loadingService') }}</span>
      <NButton data-other-service-action="ping" size="tiny" tertiary @click="loadOtherServiceStatus">
        {{ t('dashboard.requestOtherService') }}
      </NButton>
      <NButton data-app-update-action="simulate" size="tiny" tertiary @click="appStore.markUpdateAvailable()">
        {{ t('dashboard.simulateAppUpdate') }}
      </NButton>
    </section>

    <section data-dashboard-stats class="mt-20px grid grid-cols-1 gap-14px sm:grid-cols-2 xl:grid-cols-4">
      <NCard v-for="item in dashboardStats" :key="item.key" :data-stat-key="item.key" size="small">
        <p class="m-0 text-13px opacity-62">{{ item.label }}</p>
        <strong class="mt-9px block text-28px font-700 tracking-tight">{{ item.value }}</strong>
        <p class="mb-0 mt-8px text-12px text-green-500">
          {{ t('dashboard.versusLastWeek', { trend: item.trend }) }}
        </p>
      </NCard>
    </section>

    <section class="mt-14px grid min-w-0 grid-cols-1 gap-14px xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <NCard data-chart-card class="min-w-0" size="small">
        <template #header>
          <span class="text-15px font-650">{{ t('dashboard.visitsTrend') }}</span>
        </template>
        <div
          ref="trafficChartRef"
          data-echarts="traffic"
          :data-chart-ready="isReady"
          :data-chart-id="chart?.id || ''"
          class="h-320px min-w-0 w-full sm:h-360px"
          role="img"
          :aria-label="t('dashboard.chartAriaLabel')"
        />
      </NCard>

      <NCard data-channel-card size="small">
        <template #header>
          <span class="text-15px font-650">{{ t('dashboard.channelShare') }}</span>
        </template>
        <div class="grid gap-18px">
          <div v-for="item in channelShares" :key="item.key" :data-channel-key="item.key">
            <div class="mb-7px flex items-center justify-between gap-12px text-13px">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}%</strong>
            </div>
            <NProgress
              :percentage="item.value"
              :show-indicator="false"
              :height="8"
              :color="themeStore.themeColorPalette.primaryColor"
              :rail-color="themeStore.darkMode ? '#374151' : '#e5e7eb'"
            />
          </div>
        </div>
      </NCard>
    </section>
  </div>
</template>
