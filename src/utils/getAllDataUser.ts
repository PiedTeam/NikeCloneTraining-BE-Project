import axios from "axios";
import usersService from "~/modules/user/user.services";

//https://storage.googleapis.com/download/storage/v1/b/nodejs-uploadpictureavatar.appspot.com/o/%2Fuploads%2F6679183417a257d1c2c91cac?generation=1720452962084222&alt=media
const responseFirebasePattern =
    /^https:\/\/storage\.googleapis\.com\/download\/storage\/v1\/b\/nodejs-uploadpictureavatar\.appspot\.com\/o\/%2Fuploads%2F[a-zA-Z0-9]+(\?generation=\d+&alt=media)?$/;

interface ResponseDataUploadImage {
    data: {
        message: string;
        details: string;
    };
}

(async function (): Promise<void> {
    try {
        const data = await usersService.getAllAccountIDAndAvatarUrl();

        // if have avatar_url, then i will send a request upload to firebase storage
        // if not, i will skip this step

        const listAccountHaveAvatar = data.filter(
            (item) =>
                item.avatar_url !== "" &&
                !responseFirebasePattern.test(item.avatar_url),
        );

        if (listAccountHaveAvatar.length === 0) {
            console.log("No account's avatar need to convert to Firebase");
            return;
        }

        console.log(
            "Account have avatar need to convert to Firebase: ",
            JSON.stringify(listAccountHaveAvatar, null, 2),
        );

        for (const account of listAccountHaveAvatar) {
            if (account._id) {
                const id = account._id.toString();
                console.time(`Processing time for account ID: ${id}`);
                try {
                    const response: ResponseDataUploadImage = await axios.post(
                        "http://localhost:4000/user/getLinkPic",
                        {
                            _id: id,
                            avatar_url: account.avatar_url,
                        },
                    );

                    // Assuming the response structure is as described
                    if (
                        response.data.message === "Upload picture successfully"
                    ) {
                        // update the avatar_url in the database
                        await usersService.updateAvatarUrl(
                            id,
                            response.data.details,
                        );
                        //"Request successful for account:",
                        console.log(
                            `Request successful for account: ${id} ${response.data.message} Details URL: ${response.data.details}`,
                        );
                    } else {
                        // Handle unexpected response structure
                        console.log(`Unexpected response for account: ${id}`);
                    }
                } catch (error) {
                    console.error("Request failed for account:", id, error);
                } finally {
                    console.timeEnd(`Processing time for account ID: ${id}`);
                }
            } else {
                console.log(
                    "userId is missing for account:",
                    JSON.stringify(account, null, 2),
                );
            }
        }
    } catch (err) {
        console.log(err);
    }
})();
