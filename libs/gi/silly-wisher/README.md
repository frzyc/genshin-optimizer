# gi-silly-wisher

This library was generated with [Nx](https://nx.dev).

This is a library for the Silly Wisher Assets used by Genshin Optimizer, with their permission to use for the April fools event.

## Grabbing assets

Things to download:
* [AssetRipper](https://github.com/AssetRipper/AssetRipper/releases/latest)
  * Extract to your preferred folder.
* [Silly Wisher xAPK](https://apkcombo.com/silly-wisher/com.sketchi.sillywisher/download/apk)
  * Once downloaded, extract/open in 7zip to grab the APK `com.sketchi.sillywisher.apk`.

Steps:
1. Open `AssetRipper.GUI.Free.exe`.
1. In the top left, click **File**, then **Open File**.
1. Open the APK `com.sketchi.sillywisher.apk` from before.
1. In the top bar, click **Export**, then **Export All Files**.
1. Create/select a folder. NOTE: All content in this folder will be deleted, it is recommended to create a blank folder for this purpose.
1. Click **Export Unity Project**.

Now the splash and portrait files should be in
`<selectedFolder>/ExportedProject/Assets/Texture2D`.

We keep the portraits as 256x256 and the splashes as 512x512.
