<?php

namespace Tests\Feature;

use App\Models\Pengguna;
use App\Models\Prediksi;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Str;

class PrediksiDashboardTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->app->detectEnvironment(fn () => 'testing');
        config([
            'app.key' => 'base64:'.base64_encode(random_bytes(32)),
            'database.default' => 'prediksi_test',
            'database.connections.prediksi_test' => ['driver' => 'sqlite', 'database' => ':memory:', 'foreign_key_constraints' => true],
            'session.driver' => 'array',
            'cache.default' => 'array',
        ]);
        $this->app->make(Kernel::class)->call('migrate', ['--force' => true]);
    }

    private function signIn(string $role): Pengguna
    {
        $user = Pengguna::create([
            'role' => $role, 'nama_pengguna' => 'Pengguna uji', 'username' => Str::random(12),
            'password' => Str::random(32), 'status_aktif' => true,
        ]);
        $this->actingAs($user);

        return $user;
    }

    public static function roles(): array
    {
        return [['Owner'], ['Field Officer']];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('roles')]
    public function test_navigation_has_no_separate_predictions_link(string $role): void
    {
        $this->signIn($role);
        $this->get('/dashboard')->assertOk()
            ->assertDontSee('href="'.url('/prediksi').'"', false)
            ->assertDontSee('title="Prediksi"', false)->assertSeeText('Prediksi kerugian');
    }

    public function test_old_prediction_bookmarks_open_the_dashboard_section(): void
    {
        $this->signIn('Field Officer');
        $this->get('/prediksi')->assertRedirect(route('dashboard').'#prediksi');
        $this->get('/prediksi?page=2')->assertRedirect(route('dashboard', ['page' => 2]).'#prediksi');
    }

    public function test_owner_can_save_the_estimate_and_read_it_back_on_the_dashboard(): void
    {
        $owner = $this->signIn('Owner');
        foreach (range(1, 7) as $monthsAgo) {
            \App\Models\Keuangan::create([
                'FK_pengguna' => $owner->getKey(), 'tanggal_transaksi' => now()->startOfMonth()->subMonths($monthsAgo),
                'jenis_transaksi' => 'Maintenance', 'nominal' => 100000, 'status_validasi' => 'Validated',
            ]);
        }

        $this->get('/dashboard')->assertOk()->assertSeeText('Perkiraan untuk')->assertSeeText('Simpan prediksi')
            ->assertSeeText('Belum ada hasil prediksi yang disimpan.');
        $this->from(route('dashboard'))->post(route('prediksi.store'))
            ->assertRedirect(route('dashboard'))->assertSessionHas('success');
        $this->get('/dashboard')->assertOk()->assertSeeText('Random Forest Regression');
        $this->assertDatabaseCount('prediksi', 1);
    }

    public function test_field_officer_can_read_but_cannot_save(): void
    {
        $this->signIn('Field Officer');
        $this->get('/dashboard')->assertOk()->assertSeeText('Riwayat prediksi tersimpan')->assertDontSeeText('Simpan prediksi');
        $this->post('/prediksi')->assertForbidden();
        $this->assertDatabaseCount('prediksi', 0);
    }

    public function test_history_pagination_stays_on_dashboard_and_keeps_the_chart_period(): void
    {
        $this->signIn('Field Officer');
        foreach (range(1, 11) as $i) {
            Prediksi::create([
                'tanggal_prediksi' => '2031-04-01',
                'hasil_prediksi' => json_encode(['metode' => sprintf('Arsip %02d', $i)]),
            ]);
        }

        $next = route('dashboard', ['periode' => 3, 'page' => 2]);
        $this->get('/dashboard?periode=3')->assertOk()->assertSeeText('Arsip 11')->assertDontSeeText('Arsip 01')
            ->assertSee('href="'.e($next.'#prediksi').'"', false);
        $this->get($next)->assertOk()->assertSeeText('Arsip 01')->assertDontSeeText('Arsip 11');
    }

    public function test_guests_cannot_access_predictions_through_either_url(): void
    {
        $this->get('/prediksi')->assertRedirect(route('login'));
        $this->get('/dashboard')->assertRedirect(route('login'));
    }

    public function test_dashboard_shows_saved_history_even_without_a_current_estimate(): void
    {
        $this->signIn('Field Officer');
        Prediksi::create([
            'tanggal_prediksi' => '2031-04-01',
            'hasil_prediksi' => json_encode(['target_bulan' => '2031-04', 'perkiraan_rupiah' => 1250000, 'metode' => 'Arsip uji']),
        ]);

        $this->get('/dashboard')->assertOk()
            ->assertSeeText('Riwayat prediksi tersimpan')->assertSeeText('2031-04')
            ->assertSeeText('Rp1.250.000')->assertSeeText('Arsip uji')->assertSeeText('Belum tersedia');
    }
}
