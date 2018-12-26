

<script>

module.exports = {
    data: () => ({
        message2: 'Hello Vue!'
    })
}

</script>

<template>
    <div>
        <span class="message2" >{{ message2 }}</span>
    </div>
</template>

<style lang="scss">

.message2 {
    color: blueviolet;
    transition: 0.3s ease;

    &:hover {
        color: deepskyblue;
    }
}

</style>
