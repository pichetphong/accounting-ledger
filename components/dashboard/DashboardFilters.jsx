'use client';

import Card from '@/components/ui/Card';
import Pill from '@/components/ui/Pill';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { SUPPORTED_CURRENCIES } from '@/lib/fx';
import { useDisplayCurrency } from '@/lib/displayCurrency';
import { PRESETS } from '@/lib/dateRange';

// Single control bar that drives the whole dashboard: display currency on the
// left, date range (This month / rolling presets / custom) on the right.
export default function DashboardFilters({ range }) {
  const { currency, setCurrency } = useDisplayCurrency();
  const { mode, preset, custom, selectMonth, selectPreset, selectCustom } = range;

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          {SUPPORTED_CURRENCIES.map((c) => (
            <Pill key={c} size="sm" active={currency === c} onClick={() => setCurrency(c)}>
              {c}
            </Pill>
          ))}
        </div>
        <DateRangePicker
          from={mode === 'custom' ? custom.from : null}
          to={mode === 'custom' ? custom.to : null}
          onChange={selectCustom}
        />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <Pill size="sm" active={mode === 'month'} onClick={selectMonth}>
          This month
        </Pill>
        {PRESETS.map((p) => (
          <Pill
            key={p}
            size="sm"
            active={mode === 'preset' && preset === p}
            onClick={() => selectPreset(p)}
          >
            {p}
          </Pill>
        ))}
      </div>
    </Card>
  );
}
