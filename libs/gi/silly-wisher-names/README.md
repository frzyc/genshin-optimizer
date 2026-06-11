# gi-silly-wisher-names

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx gen-file gi-silly-wisher-names` to build the library.

## Updating the translation file

Things to download:
* [UABEA](https://github.com/nesrak1/UABEA/releases/latest)
  * Extract to your preferred folder.
* [Silly Wisher xAPK](https://apkcombo.com/silly-wisher/com.sketchi.sillywisher/download/apk)
  * Once downloaded, extract/open in 7zip to grab the APK `com.sketchi.sillywisher.apk`.
* [Custom fork of I2Editor](https://github.com/nguyentvan7/I2Editor/releases/latest)
  * Extract to your preferred folder.

Steps:
1. Open APK `com.sketchi.sillywisher.apk` in 7zip, or extract to a preferred folder.
1. Grab the `assets/bin/Data/data.unity3d` file and keep it somewhere.
1. Open `UABEAvalonia.exe`.
1. In the top left, click **File**, then **Open**.
1. Open the `data.unity3d` file from before.
1. In the dropdown, select `resources.assets`.
1. Click **Export** and export it somewhere.
1. In the top bar, click **File**, then **Open**.
1. Open the `resources.assets` file from before.
1. Scroll down to `I2Languages` and click it.
1. On the right, click **Export Raw** and save it somewhere.
1. Open `I2Editor.exe`
1. In the top left, click **File**, then **Import .dat file**.
1. Open the `I2Languages-resources.assets-<>.dat` file from before.
1. In the top left, click **File**, then **Save Project**.
1. Create a new blank folder, and save the project there.

Now the translation files should be in
`<selectedFolder>/locales`.

You may also need to update the character key mapping table in the executor
script.
