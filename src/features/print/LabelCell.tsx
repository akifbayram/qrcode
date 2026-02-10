import type { Bin } from '@/types';
import { resolveIcon } from '@/lib/iconMap';
import { getColorPreset } from '@/lib/colorPalette';
import type { LabelFormat } from './labelFormats';

interface LabelCellProps {
  bin: Bin;
  qrDataUrl: string;
  format: LabelFormat;
  showColorSwatch?: boolean;
}

export function LabelCell({ bin, qrDataUrl, format, showColorSwatch }: LabelCellProps) {
  const Icon = resolveIcon(bin.icon);
  const colorPreset = showColorSwatch && bin.color ? getColorPreset(bin.color) : null;

  return (
    <div
      className="label-cell flex items-center gap-[4pt] overflow-hidden"
      style={{ width: format.cellWidth, height: format.cellHeight, padding: format.padding }}
    >
      {qrDataUrl && (
        <img
          src={qrDataUrl}
          alt=""
          className="shrink-0"
          style={{ width: format.qrSize, height: format.qrSize }}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="label-name font-semibold truncate flex items-center gap-[2pt]" style={{ fontSize: format.nameFontSize }}>
          <Icon className="h-[8pt] w-[8pt] shrink-0" />
          {colorPreset && (
            <span
              className="color-swatch-print shrink-0 rounded-full"
              style={{
                width: '8pt',
                height: '8pt',
                backgroundColor: colorPreset.bg,
                display: 'inline-block',
              }}
            />
          )}
          <span>{bin.name}</span>
        </div>
        {bin.location && (
          <div className="label-contents text-gray-600 line-clamp-2" style={{ fontSize: format.contentFontSize }}>
            {bin.location}
          </div>
        )}
        {bin.short_code && (
          <div
            className="label-code text-gray-500 font-mono"
            style={{ fontSize: format.codeFontSize }}
          >
            {bin.short_code}
          </div>
        )}
      </div>
    </div>
  );
}
