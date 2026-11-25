<?php

namespace App\Services;

use InvalidArgumentException;

/**
 * Random Forest regresi sungguhan, tanpa library eksternal:
 * bootstrap sampling + decision trees + subset fitur acak + minimisasi SSE.
 * Diadaptasi dari js/predict.js pada prototipe Sengonis asli.
 */
class RandomForestRegressor
{
    private int $state;

    public function __construct(
        private readonly int $trees = 50,
        private readonly int $maxDepth = 5,
        private readonly int $minLeaf = 2,
        private readonly int $seed = 7,
    ) {
        $this->state = $seed;
    }

    /** @param array<array<float|int>> $x @param array<float|int> $y @param array<float|int> $features */
    public function predict(array $x, array $y, array $features): float
    {
        $n = count($x);
        if ($n < 6 || count($y) !== $n || !$features || !$x[0] || count($features) !== count($x[0])) {
            throw new InvalidArgumentException('Random Forest memerlukan minimal 6 pasangan data dengan jumlah fitur yang sesuai.');
        }
        foreach ($x as $row) {
            if (count($row) !== count($features)) {
                throw new InvalidArgumentException('Dimensi fitur tidak konsisten.');
            }
            foreach ($row as $value) {
                if (!is_numeric($value) || !is_finite((float) $value)) throw new InvalidArgumentException('Fitur tidak valid.');
            }
        }
        foreach ([...$y, ...$features] as $v) {
            if (!is_numeric($v) || !is_finite((float) $v)) throw new InvalidArgumentException('Nilai model tidak valid.');
        }

        $this->state = $this->seed;
        $total = 0.0;
        for ($t = 0; $t < $this->trees; $t++) {
            $sample = [];
            for ($i = 0; $i < $n; $i++) {
                $sample[] = (int) floor($this->random() * $n);
            }
            $tree = $this->grow($x, $y, $sample, $this->maxDepth);
            $total += $this->walk($tree, $features);
        }
        return max(0.0, $total / $this->trees);
    }

    private function grow(array $x, array $y, array $indices, int $depth): array
    {
        $mean = array_sum(array_map(fn ($i) => (float) $y[$i], $indices)) / count($indices);
        if ($depth <= 0 || count($indices) < 2 * $this->minLeaf) return ['v' => $mean];

        $featureCount = count($x[0]);
        $featureIds = range(0, $featureCount - 1);
        // Fisher–Yates: pengambilan fitur acak yang valid (bukan sort dengan comparator random).
        for ($i = $featureCount - 1; $i > 0; $i--) {
            $j = (int) floor($this->random() * ($i + 1));
            [$featureIds[$i], $featureIds[$j]] = [$featureIds[$j], $featureIds[$i]];
        }
        $mtry = max(1, (int) floor(sqrt($featureCount)));
        $best = null;
        foreach (array_slice($featureIds, 0, $mtry) as $f) {
            $values = array_unique(array_map(fn ($i) => (float) $x[$i][$f], $indices));
            sort($values, SORT_NUMERIC);
            for ($k = 1; $k < count($values); $k++) {
                $threshold = ($values[$k - 1] + $values[$k]) / 2;
                $left = []; $right = [];
                foreach ($indices as $i) {
                    if ($x[$i][$f] <= $threshold) $left[] = $i;
                    else $right[] = $i;
                }
                if (count($left) < $this->minLeaf || count($right) < $this->minLeaf) continue;
                $score = $this->sse($y, $left) + $this->sse($y, $right);
                if ($best === null || $score < $best['score']) {
                    $best = compact('f', 'threshold', 'left', 'right') + ['score' => $score];
                }
            }
        }
        if (!$best) return ['v' => $mean];
        return [
            'f' => $best['f'], 't' => $best['threshold'],
            'l' => $this->grow($x, $y, $best['left'], $depth - 1),
            'r' => $this->grow($x, $y, $best['right'], $depth - 1),
        ];
    }

    private function sse(array $targets, array $indices): float
    {
        $values = array_map(fn ($i) => (float) $targets[$i], $indices);
        $avg = array_sum($values) / count($values);
        return array_sum(array_map(fn ($v) => ($v - $avg) ** 2, $values));
    }

    private function walk(array $node, array $features): float
    {
        while (!array_key_exists('v', $node)) {
            $node = (float) $features[$node['f']] <= $node['t'] ? $node['l'] : $node['r'];
        }
        return (float) $node['v'];
    }

    private function random(): float
    {
        $this->state = (int) (($this->state * 1664525 + 1013904223) % 4294967296);
        return $this->state / 4294967296;
    }
}
