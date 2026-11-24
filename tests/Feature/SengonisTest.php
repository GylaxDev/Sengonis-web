<?php

namespace Tests\Feature;

use App\Models\Plant;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SengonisTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_renders_blade_layout(): void
    {
        $this->get(route('login'))
            ->assertOk()
            ->assertSee('Sign in to Sengonis')
            ->assertSee('assets/js/app.js', false);
    }

    public function test_dashboard_and_profile_receive_username_from_request(): void
    {
        $owner = User::factory()->owner()->create(['username' => 'owner']);

        $this->actingAs($owner)
            ->get('/?username=budi')
            ->assertOk()
            ->assertSee('Welcome, budi');

        $this->actingAs($owner)
            ->get('/profile?username=siti')
            ->assertOk()
            ->assertSee('Signed in as siti.');
    }

    public function test_plant_pages_use_blade_components_and_foreach(): void
    {
        $owner = User::factory()->owner()->create();
        Plant::create([
            'tgl' => now()->toDateString(),
            'tinggi' => 3.5,
            'dia' => 4.2,
            'blok' => 2,
            'st' => 'Growing',
        ]);

        $this->actingAs($owner)
            ->get(route('plants.index'))
            ->assertOk()
            ->assertSee('Growing');
    }

    public function test_owner_can_create_a_plant(): void
    {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner)->post(route('plants.store'), [
            'tgl' => now()->toDateString(),
            'tinggi' => 4.1,
            'dia' => 5.0,
            'blok' => 1,
            'st' => 'Mature',
        ])->assertRedirect(route('plants.index'));

        $this->assertDatabaseHas('plants', ['st' => 'Mature', 'blok' => 1]);
    }

    public function test_officer_cannot_access_owner_users_page(): void
    {
        $officer = User::factory()->create(['role' => 'Officer']);

        $this->actingAs($officer)->get(route('users.index'))->assertForbidden();
    }

    public function test_owner_can_verify_and_archive_reports(): void
    {
        $owner = User::factory()->owner()->create();
        $report = Report::create([
            'jenis' => 'financial',
            'periode' => now()->format('Y-m'),
            'masuk' => 1000,
            'keluar' => 400,
        ]);

        $this->actingAs($owner)
            ->patch(route('reports.verify', $report))
            ->assertRedirect(route('reports.index'));

        $this->actingAs($owner)
            ->patch(route('reports.archive', $report))
            ->assertRedirect(route('reports.index'));

        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => 'Verified',
            'arsip' => true,
        ]);
    }

    public function test_page_controller_routes_render_blade(): void
    {
        $this->get(route('pages.home'))->assertOk()->assertSee('Plantation manager');
        $this->get(route('pages.dashboard', ['username' => 'andi']))->assertOk()->assertSee('Welcome, andi');
        $this->get(route('pages.profile', ['username' => 'andi']))->assertOk()->assertSee('Signed in as andi.');
        $this->get(route('pages.settings'))->assertOk()->assertSee('Current section: general');
    }

    public function test_api_weather_endpoint_returns_json(): void
    {
        $this->getJson('/api/weather?location=invalid')
            ->assertOk()
            ->assertJson([]);
    }
}
