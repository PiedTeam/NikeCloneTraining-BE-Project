import usersService from "~/modules/user/user.services";
(async function () {
    try {
        const data = await usersService.findAllUser();
        console.log(data);
    } catch (err) {
        console.log(err);
    }
})();
