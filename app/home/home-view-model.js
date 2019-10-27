const observableModule = require("tns-core-modules/data/observable");

function HomeViewModel() {
    const viewModel = observableModule.fromObject({
        /* Add your view model properties here */
        pause:false
    });

    return viewModel;
}

module.exports = HomeViewModel;
