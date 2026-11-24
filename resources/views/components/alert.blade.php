@if (session('status'))
    <div class="alert" role="status">{{ session('status') }}</div>
@endif

@if ($errors->any())
    <div class="alert" role="alert">
        {{ $errors->first() }}
    </div>
@endif
