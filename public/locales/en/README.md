# Localization Notes

This guide provides tips to make translation easier and more efficient.

1. You can reference other keys like so. For more info, see: https://www.i18next.com/translation-function/nesting

```
{
  "app-welcome": "Welcome to $t(pageTitle)!"
}
```

2. You can reference substution values like so. The app will populate these values for you. For more info, see: https://www.i18next.com/translation-function/interpolation

```
{
  "appVersion": "$t(pageTitle) version: {{version}}"
}
```

3. You can include a key with the name <KEY>_plural to automatically pluralize. Note that for this to work the substitution value must be named `count`. For more complex plurals, see: https://www.i18next.com/translation-function/plurals

```
{
  "apple": "You have {{count}} apple.",
  "apple_plural": "You have {{count}} apples."
}
```

4. When translating longer strings that contain basic tags in them (like lists or bold text), there is a more complex procedure. Follow these steps (For more info, see https://react.i18next.com/latest/trans-component). You will have to do these steps every time tags get added to the string.

  * Make sure `debug = true` in the `I18n/index.js` options.
  * Wrap the text in `<Trans i18nKey="<KEY>">` and `</Trans>` tags. Don't specify the key value in the locales.
  * Go to the page the text is on and check the console. You should see a message that looks like this:

```
missingKey en settings charsStored <0>{{count}}</0> Characters Stored
```

  * Paste the last part of the message in to use it as the translation value. Make sure any translations maintain the numbers of the tags.

5. You can store whole arrays of localized data. See: https://www.i18next.com/translation-function/objects-and-arrays

6. By providing a context you can easily differ similar translations.

```
{
  "character-name_Albedo": "Albedo",
  "elemental-skill-name_Albedo": "Abiogenesis: Solar Isotoma",
  "character-name_Razor": "Razor",
  "elemental-skill-name_Razor": "Claw and Thunder"
}

then

<Trans i18nKey="character-name" context="Albedo" /> uses <Trans i18nKey="elemental-skill-name" context="Albedo" />.
<Trans i18nKey="character-name" context="Razor" /> uses <Trans i18nKey="elemental-skill-name" context="Razor" />.

returns

Albedo uses Abiogenesis: Solar Isotoma
Razor uses Claw and Thunder
```