<section id="prediksi" class="card col" aria-labelledby="judul-prediksi">
    <div>
        <div class="ch-h">
            <h2 id="judul-prediksi"><i data-lucide="trending-up"></i>Prediksi kerugian</h2>
            @if(auth()->user()->isOwner())
                <form method="POST" action="{{ route('prediksi.store') }}">
                    @csrf
                    <button class="btn" type="submit" @disabled(!$prediksiSaatIni)><i data-lucide="save"></i>Simpan prediksi</button>
                </form>
            @endif
        </div>
        @if($prediksiSaatIni)
            <p>Perkiraan untuk <strong>{{ $prediksiSaatIni['target_bulan'] }}</strong>: <strong>Rp{{ number_format($prediksiSaatIni['perkiraan_rupiah'], 0, ',', '.') }}</strong>. Data terakhir: {{ $prediksiSaatIni['data_sampai'] }}.</p>
            <div class="hstat">
                <div>Rata-rata arus kas<b>Rp{{ number_format($prediksiSaatIni['rerata_arus_kas'], 0, ',', '.') }}</b></div>
                <div>Rata-rata pohon mati<b>{{ number_format($prediksiSaatIni['rerata_kematian'], 1, ',', '.') }}/bulan</b></div>
                <div>Jumlah bulan historis<b>{{ $prediksiSaatIni['jumlah_bulan'] }} bulan</b></div>
                <div>Kerugian aktual bulan terakhir<b>Rp{{ number_format($prediksiSaatIni['kerugian_terakhir'], 0, ',', '.') }}</b></div>
            </div>
        @else
            <p class="mini-sub">Prediksi belum tersedia. Diperlukan transaksi tervalidasi dari setidaknya 7 bulan berbeda yang sudah selesai.</p>
        @endif
    </div>
    <div>
        <div class="ch-h"><h3>Riwayat prediksi tersimpan</h3></div>
        <div class="tw"><div class="sc">
            <table aria-label="Riwayat prediksi tersimpan">
                <thead><tr><th class="table-heading">Tanggal</th><th class="table-heading">Periode target</th><th class="table-heading">Prediksi</th><th class="table-heading">Metode</th></tr></thead>
                <tbody>
                    @forelse($riwayatPrediksi as $item)
                        @php($hasil = json_decode($item->hasil_prediksi ?? '', true))
                        <tr>
                            <td>{{ $item->tanggal_prediksi->format('d/m/Y') }}</td>
                            <td>{{ $hasil['target_bulan'] ?? '—' }}</td>
                            <td><b>{{ is_numeric($hasil['perkiraan_rupiah'] ?? null) ? 'Rp'.number_format($hasil['perkiraan_rupiah'], 0, ',', '.') : '—' }}</b></td>
                            <td>{{ $hasil['metode'] ?? 'Data lama' }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="4" class="no-data">Belum ada hasil prediksi yang disimpan.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>@include('partials.pagination', ['items' => $riwayatPrediksi])</div>
    </div>
</section>
