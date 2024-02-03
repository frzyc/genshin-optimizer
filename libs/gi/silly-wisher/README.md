# gi-silly-wisher

This library was generated with [Nx](https://nx.dev).

This is a library for the Silly Wisher Assets used by Genshin Optimizer, with their permission to use for the April fools event.

## Updating the splash and portrait art

You can extract the assets from the Silly Wisher APK. I used
[AssetRipper](https://github.com/AssetRipper/AssetRipper) for this. Make sure
to run the extractor on the entire contents of the APK, not just the
`data.unity3d` file.

The Silly Wisher APK should be available at APKCombo
[here](https://apkcombo.com/silly-wisher/com.sketchi.sillywisher/download/apk).

```bash
mkdir silly-wisher
unzip -d silly-wisher "Silly Wisher_${SILLY_WISHER_VERSION}_apkcombo.com.apk"

mkdir asset-ripper
unzip -d asset-ripper AssetRipper.zip
./asset-ripper/AssetRipper silly-wisher
```

Now the splash and portrait files should be in
`asset-ripper/Ripped/ExportedProject/Assets/Texture2D`. The language assets
file should be in
`asset-ripper/Ripped/ExportedProject/Assets/Resources/I2Languages.asset`.

We keep the portraits as 256x256 and the splashes as 512x512.
