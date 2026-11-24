@props(['rows' => [], 'columns' => []])
<div class="tbl">
    <table>
        <thead>
            <tr>
                @foreach ($columns as $column)
                    <th>{{ $column }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    @foreach ($columns as $key => $column)
                        <td>{{ is_array($row) ? ($row[$key] ?? '') : ($row->{$key} ?? '') }}</td>
                    @endforeach
                </tr>
            @empty
                <tr><td colspan="{{ count($columns) }}">No records yet.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
