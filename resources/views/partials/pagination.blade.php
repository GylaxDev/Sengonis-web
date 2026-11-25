@if($items->hasPages())
<div class="pg">
    <span>Menampilkan {{ $items->firstItem() }}–{{ $items->lastItem() }} dari {{ $items->total() }} data</span>
    <div class="row">
        @if($items->onFirstPage())<span class="btn ghost sm" aria-disabled="true">Sebelumnya</span>@else<a class="btn ghost sm" href="{{ $items->previousPageUrl() }}">Sebelumnya</a>@endif
        <span>Halaman {{ $items->currentPage() }} / {{ $items->lastPage() }}</span>
        @if($items->hasMorePages())<a class="btn ghost sm" href="{{ $items->nextPageUrl() }}">Berikutnya</a>@else<span class="btn ghost sm" aria-disabled="true">Berikutnya</span>@endif
    </div>
</div>
@endif
