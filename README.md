Genshin Optimize is a helper website for the online action-rpg gacha game [Genshin Impact](https://genshin.mihoyo.com/). It is intended to assist players with optimizing artifacts to max-min their characters, while providing a clean, structured UI, and provide real-time results.

For support/feedback/suggestions, please join our [Discord server](https://discord.gg/CXUbQXyfUs).


# Getting Started with Genshin Optimizer.
This project is primarily bootstrapped with with [Create React App](https://github.com/facebook/create-react-app). Most of the original functions are retained.

## Available Scripts

In the project directory, you can run:

### `npm install`
Install all dependencies/modules to build the site.

`postinstall:` Pulls the [GenshinData repo](https://github.com/Dimbreath/GenshinData) into `pipeline/GenshinData`.

### `npm start`
`prestart: npm run gen-files`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`
`prebuild: npm run gen-files`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run deploy`
`predeploy: npm run build`

Deploy the site using Github Pages. 

### `npm run analyze`
To view graphically the size/structure of the built bundles. For optimizing payload size of the built site.

### `npm run testserver`
To create a "production" server

### `npm run localization-gen-main`
Combine all english translation as a single JSON to be uploaded to translation site.
Will generate the JSON as `/public/locales/en/main_gen.json`.

### `npm run localization-load`
Load the translated JSON into each locale, and separate them into namespaces.
Load the translations from [POEditor](https://poeditor.com/projects/view?id=439583) into `/src/pipeline/Translated`.

### `npm run pipeline-datamined`
Generate localization & data from datamined data in `pipeline/GenshinData` from the repo [Dimbreath/GenshinData](https://github.com/Dimbreath/GenshinData)
This will create localization files in `/public/locales/...` with in-game translated text.

### `npm run gen-files`
`npm run pipeline-datamined && npm run localization-load`

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
