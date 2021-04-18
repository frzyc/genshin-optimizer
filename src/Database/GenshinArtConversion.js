import ArtifactDatabase from '../Database/ArtifactDatabase';

const ArtifactSlotKeyMap = {
    "flower": "flower",
    "feather": "plume",
    "sand": "sands",
    "cup": "goblet",
    "head": "circlet"
};

const DefaultVersion = "1";

const GetConvertedArtifactsOfVersion = {
    "1": GetConvertedArtifactsVersion1
};

function GetConvertedArtifactsVersion1(dataObj, ignoreDupe) {

}

function GenshinArtImport(dataObj, deleteExisting, ignoreDupe) {
    if (deleteExisting) {
        ignoreDupe = false;  // ignoreDupe should be disabled when deleteExisting is turned on
    }
    
    let importedArtifacts = GetConvertedArtifactsOfVersion["version" in dataObj ? dataObj.version : DefaultVersion](dataObj, ignoreDupe);

    // TODO    
}

const GenshinArtCheckForErrorVersion = {
    "1": GenshinArtDataCheckForErrorVersion1
};

function GenshinArtDataCheckForErrorVersion1(dataObj) {
    for (const property in dataObj) {
        if (property in ArtifactSlotKeyMap && !Array.isArray(dataObj[property])) {
            return `Invalid type for "${property}", expected array`;
        }
    }
    return "";
}

function GenshinArtDataCheckForError(dataObj) {
    let checkingVersion;
    if ("version" in dataObj) {
        if (!(dataObj.version in GenshinArtCheckForErrorVersion)) {
            return `Unknown version: ${dataObj.version}`;
        }
        checkingVersion = dataObj.version;
    } else {
        checkingVersion = DefaultVersion;
    }

    return GenshinArtCheckForErrorVersion[checkingVersion](dataObj);
}

function GenshinArtGetCount(dataObj) {
    let count = 0;
    for (const property in dataObj) {
        if (property in ArtifactSlotKeyMap) {
            count += dataObj[property].length;
        }
    }
    return count;
}

export { GenshinArtDataCheckForError, GenshinArtGetCount, GenshinArtImport };
