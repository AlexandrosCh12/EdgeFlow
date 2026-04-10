/**
 * DisciplineChart.tsx
 * Seven-point discipline trend: smooth SVG line plus soft fill under the curve.
 */

import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { Colors } from '../src/theme';

type DisciplineChartProps = {
  series: number[];
  height: number;
};

function clampSeries(series: number[]) {
  return series.length ? series : [0, 0, 0, 0, 0, 0, 0];
}

// Cubic beziers between midpoints — smooth path through daily scores
function createSmoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) {
    return '';
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const controlX = (current.x + next.x) / 2;

    path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
}

export function DisciplineChart({ series, height }: DisciplineChartProps) {
  const values = clampSeries(series);
  const width = 320;
  const topPadding = 8;
  const bottomPadding = 16;
  const usableHeight = height - topPadding - bottomPadding;
  const maxValue = Math.max(...values, 100);
  const minValue = Math.min(...values, 0);

  const points = values.map((value, index) => {
    const x =
      values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const normalized =
      maxValue === minValue ? 0.5 : (value - minValue) / (maxValue - minValue);
    const y = topPadding + (1 - normalized) * usableHeight;

    return { x, y };
  });

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  // Area fill uses vertical gradient under the line for a soft glow

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="rgba(59,138,219,0.15)" />
            <Stop offset="100%" stopColor="rgba(59,138,219,0)" />
          </LinearGradient>
        </Defs>

        <Path d={areaPath} fill="url(#chartFill)" />
        <Path
          d={linePath}
          fill="none"
          stroke={Colors.chartBlue}
          strokeWidth={2}
        />

        <Circle cx={firstPoint.x} cy={firstPoint.y} r={2.5} fill={Colors.chartBlue} />
        <Circle cx={lastPoint.x} cy={lastPoint.y} r={4} fill="rgba(59,138,219,0.2)" />
        <Circle cx={lastPoint.x} cy={lastPoint.y} r={3} fill={Colors.chartBlue} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
});
