var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Plugins } from "@capacitor/core";
import { CodePushUtil } from "./codePushUtil";
import { LocalPackage } from "./localPackage";
import { NativeAppInfo } from "./nativeAppInfo";
import { Package } from "./package";
import { Sdk } from "./sdk";
import { Directory, Filesystem } from "@capacitor/filesystem";
const { Http } = Plugins;
/**
 * Defines a remote package, which represents an update package available for download.
 */
export class RemotePackage extends Package {
    constructor() {
        super(...arguments);
        this.isDownloading = false;
    }
    /**
     * Downloads the package update from the CodePush service.
     * TODO: implement download progress
     *
     * @param downloadProgress Optional callback invoked during the download process. It is called several times with one DownloadProgress parameter.
     */
    download(downloadProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            CodePushUtil.logMessage("Downloading update");
            if (!this.downloadUrl) {
                CodePushUtil.throwError(new Error("The remote package does not contain a download URL."));
            }
            this.isDownloading = true;
            const file = LocalPackage.DownloadDir + "/" + LocalPackage.PackageUpdateFileName;
            const fullPath = yield Filesystem.getUri({ directory: Directory.Data, path: file });
            try {
                yield Filesystem.mkdir({
                    path: LocalPackage.DownloadDir,
                    directory: Directory.Data,
                    recursive: true,
                });
                yield Http.downloadFile({
                    url: this.downloadUrl,
                    filePath: file,
                    fileDirectory: Directory.Data
                });
            }
            catch (e) {
                CodePushUtil.throwError(new Error("An error occured while downloading the package. " + (e && e.message) ? e.message : ""));
            }
            finally {
                this.isDownloading = false;
            }
            const installFailed = yield NativeAppInfo.isFailedUpdate(this.packageHash);
            const localPackage = new LocalPackage();
            localPackage.deploymentKey = this.deploymentKey;
            localPackage.description = this.description;
            localPackage.label = this.label;
            localPackage.appVersion = this.appVersion;
            localPackage.isMandatory = this.isMandatory;
            localPackage.packageHash = this.packageHash;
            localPackage.isFirstRun = false;
            localPackage.failedInstall = installFailed;
            localPackage.localPath = fullPath.uri;
            CodePushUtil.logMessage("Package download success: " + JSON.stringify(localPackage));
            Sdk.reportStatusDownload(localPackage, localPackage.deploymentKey);
            return localPackage;
        });
    }
    /**
     * Aborts the current download session, previously started with download().
     */
    abortDownload() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: implement download abort
            return new Promise((resolve) => {
                this.isDownloading = false;
                resolve();
            });
        });
    }
}
//# sourceMappingURL=remotePackage.js.map