module.exports = {
    test(){
        console.log('hi');
        console.log(this.name); //assume this is the creep context?
    }
};