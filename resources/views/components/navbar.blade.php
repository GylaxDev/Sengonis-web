@props(['username' => null])
<header class="topbar">
    <button class="ibtn plain menubtn" data-a="nav" aria-label="Open menu">☰</button>
    <button class="spill" data-a="pal" aria-label="Search"><span>Search plants, transactions and pages</span></button>
    <div class="sp"></div>
    <button class="ibtn tm" data-a="theme2" aria-label="Toggle dark mode">◐</button>
    <div class="pw"><button class="avbtn" data-a="pop" data-i="p-u" aria-label="Account">{{ strtoupper(substr($username ?? '?', 0, 1)) }}</button></div>
</header>
