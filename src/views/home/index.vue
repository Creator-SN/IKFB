<template>
    <div class="hello">
        <img
            alt="Vue logo"
            src="@/assets/logo.png"
        >
        <h1>{{ msg }}</h1>
        <p>
            For a guide and recipes on how to configure / customize this project,<br>
            check out the guide.
        </p>
        <div class="button">
            <fv-button theme="dark" background="rgba(0, 204, 153, 1)" borderRadius="3" style="width: 120px; height: 35px;" @click="to">Quick Tour</fv-button>
        </div>
    </div>
</template>

<script>
export default {
    name: "HelloWorld",
    props: {
        msg: {
            type: String,
            default: "Welcome to VFluent for Electron!",
        },
    },
    methods: {
        to () {
            window.location = 'https://github.com/aleversn/VFluentForElectron';
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}
.hello
{
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    text-align: center;
    line-height: 1.5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.button
{
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>