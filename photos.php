<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

$extensions = ['jpg', 'jpeg', 'png', 'webp'];

function scanFolder(string $folder, string $prefix): array {
    global $extensions;
    $photos = [];

    if (!is_dir($folder)) {
        return $photos;
    }

    $pattern = '/^' . preg_quote($prefix, '/') . '(\d+)$/i';

    foreach (scandir($folder) as $file) {
        if ($file === '.' || $file === '..') continue;

        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (!in_array($ext, $extensions, true)) continue;

        $name = pathinfo($file, PATHINFO_FILENAME);
        if (!preg_match($pattern, $name, $m)) continue;

        $photos[] = [
            'src'    => $folder . '/' . $file,
            'index'  => (int) $m[1],
            'folder' => $folder,
            'prefix' => $prefix,
        ];
    }

    usort($photos, fn($a, $b) => $a['index'] - $b['index']);
    return $photos;
}

$folders = [
    'cover'    => ['folder' => 'cover',    'prefix' => 'cover'],
    'feed'     => ['folder' => 'feed',     'prefix' => 'feed'],
    'group'    => ['folder' => 'group',    'prefix' => 'group'],
    'funny'    => ['folder' => 'funny',    'prefix' => 'funny'],
    'romantic' => ['folder' => 'romantic', 'prefix' => 'romantic'],
    'food'     => ['folder' => 'food',     'prefix' => 'food'],
    'moments'  => ['folder' => 'moments',  'prefix' => 'moments'],
    'official' => ['folder' => 'official', 'prefix' => 'official'],
    'personal' => ['folder' => 'personal', 'prefix' => 'personal'],
];

$result = ['source' => 'php', 'folders' => []];

foreach ($folders as $key => $info) {
    $result['folders'][$key] = scanFolder($info['folder'], $info['prefix']);
}

echo json_encode($result);
