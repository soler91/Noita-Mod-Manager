<template>
    <div v-show="isPicking" class="picker-backdrop" @click="ClosePicker">
        <div class="picker-modal" @click.stop="nop">
            <div class="picker-modal-body" @click.stop="nop">
                <ColorPicker
                    theme="dark"
                    :color="color"
                    @changeColor="changeColor"
                />
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-6">
            <div class="row">
                <button
                    type="button"
                    class="btn btn-primary btn-lg btn-block rounded-0"
                    @click="OpenModsFile"
                >
                    Open
                </button>
            </div>
        </div>
        <div class="col-6">
            <div class="row">
                <button
                    :disabled="!canSave"
                    type="button"
                    class="btn btn-primary btn-lg btn-block rounded-0"
                    @click="SaveFile"
                >
                    Save
                </button>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12" v-if="mods.length > 0">
            <draggable
                v-model="mods"
                class="list-group"
                group="mods"
                :component-data="{
                    tag: 'ul',
                    type: 'transition-group',
                    name: !drag ? 'flip-list' : null,
                }"
                @start="startDrag"
                @end="endDrag"
                item-key="_id"
                animation="200"
            >
                <template #item="{ element }">
                    <li
                        class="list-group-item rounded-0"
                        :style="{ background: element._color }"
                    >
                        <div class="row">
                            <div class="form-check col-9">
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    value=""
                                    :id="element._id"
                                    v-model="element.attributes.enabled"
                                />
                                <label
                                    class="form-check-label"
                                    :for="element._id"
                                >
                                    {{ element.attributes.name }}
                                </label>
                            </div>
                            <div class="col-1 ms-auto">
                                <i
                                    class="fa-solid fa-paintbrush"
                                    @click="ShowPicker(element)"
                                ></i>
                            </div>
                        </div>
                    </li>
                </template>
            </draggable>
        </div>
    </div>
</template>

<script>
//import xml from "xml-js/lib";
import draggable from "vuedraggable";
import { ColorPicker } from "vue-color-kit";
export default {
    components: { draggable, ColorPicker },
    data() {
        return {
            color: "#3b3b3b",
            canSave: false,
            drag: false,
            mods: [],
            isPicking: false,
            selectedMod: "",
        };
    },
    beforeCreate() {
        const colors = localStorage.getItem("colors");
        if (colors === null) {
            localStorage.setItem("colors", "{}");
        }
    },
    mounted() {
        window.api.receive("mods", (stuff) => {
            const colors = JSON.parse(localStorage.getItem("colors"));
            let dirty = false;
            this.mods = stuff.map((entry) => {
                const id = `${entry.attributes.name}_${entry.attributes.workshop_item_id}`;
                if (typeof colors[id] === "undefined") {
                    colors[id] = { id, color: "#3b3b3b" };
                    dirty = true;
                }
                entry.attributes.enabled = Boolean(
                    parseInt(entry.attributes.enabled)
                );
                entry._color = colors[id].color;
                entry._id = id;
                return entry;
            });
            if (dirty) {
                localStorage.setItem("colors", JSON.stringify(colors));
            }
            this.canSave = true;
        });
    },
    methods: {
        startDrag() {
            this.drag = true;
        },
        endDrag() {
            this.drag = false;
            console.log(JSON.stringify(this.mods));
            //figure out how the heck to save file
        },
        async OpenModsFile() {
            try {
                api.send("OpenFile");
            } catch (error) {
                //boo 👻👻👻👻👻
            }
        },
        SaveFile() {
            const colors = JSON.parse(localStorage.getItem("colors"));
            const data = JSON.parse(JSON.stringify(this.mods)).map(entry => {
                colors[entry._id].color = entry._color
                delete entry._id
                delete entry._color
                entry.attributes.enabled = entry.attributes.enabled ? "1" : "0"
                return entry
            })
            localStorage.setItem("colors", JSON.stringify(colors))
            api.send("SaveFile", data)
        },
        ShowPicker(obj) {
            this.isPicking = true;
            this.selectedMod = obj._id;
        },
        ClosePicker() {
            this.isPicking = false;
        },
        changeColor(color) {
            for (const element of this.mods) {
                if (element._id == this.selectedMod) {
                    element._color = color.hex;
                }
            }
        },
        nop() {},
    },
};
</script>

<style>
.picker {
    z-index: 69;
}

.flip-list-move {
    transition: transform 0.5s;
}
.no-move {
    transition: transform 0s;
}
.list-group {
    min-height: 20px;
}
.list-group-item {
    cursor: move;
}
.list-group-item i {
    cursor: pointer;
}
html {
    background-color: #01010e;
}

body {
    overflow-x: hidden;
    background-color: #01010e;
}

.picker-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 69;
}

.picker-modal {
    overflow-x: auto;
    display: flex;
    flex-direction: column;
}

.picker-modal-body {
    display: flex;
}

.saturation {
    position: relative;
    cursor: pointer;
}
.saturation .slide {
    position: absolute;
    left: 100px;
    top: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid #fff;
    box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.3);
    pointer-events: none;
}
.hue {
    position: relative;
    margin-left: 8px;
    cursor: pointer;
}
.hue .slide {
    position: absolute;
    left: 0;
    top: 100px;
    width: 100%;
    height: 4px;
    background: #fff;
    box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.3);
    pointer-events: none;
}
.color-alpha {
    position: relative;
    margin-left: 8px;
    cursor: pointer;
}
.color-alpha .slide {
    position: absolute;
    left: 0;
    top: 100px;
    width: 100%;
    height: 4px;
    background: #fff;
    box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.3);
    pointer-events: none;
}
.sucker {
    width: 30px;
    fill: #9099a4;
    background: #2e333a;
    cursor: pointer;
    transition: all 0.3s;
}
.sucker.active,
.sucker:hover {
    fill: #1593ff;
}
.color-type {
    display: flex;
    margin-top: 8px;
    font-size: 12px;
}
.color-type .name {
    width: 60px;
    height: 30px;
    float: left;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
    background: #252930;
}
.color-type .value {
    flex: 1;
    height: 30px;
    min-width: 100px;
    padding: 0 12px;
    border: 0;
    color: #fff;
    background: #2e333a;
    box-sizing: border-box;
}
.colors {
    padding: 0;
    margin: 0;
}
.colors.history {
    margin-top: 10px;
    border-top: 1px solid #2e333a;
}
.colors .item {
    position: relative;
    width: 16px;
    height: 16px;
    margin: 10px 0 0 10px;
    border-radius: 3px;
    box-sizing: border-box;
    vertical-align: top;
    display: inline-block;
    transition: all 0.1s;
    cursor: pointer;
}
.colors .item:nth-child(8n + 1) {
    margin-left: 0;
}
.colors .item:hover {
    transform: scale(1.4);
}
.colors .item .alpha {
    height: 100%;
    border-radius: 4px;
}
.colors .item .color {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 3px;
}
.hu-color-picker {
    padding: 10px;
    background: #1d2024;
    border-radius: 4px;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    z-index: 1;
    box-sizing: content-box;
}
.hu-color-picker.light {
    background: #f7f8f9;
}
.hu-color-picker.light .color-show .sucker {
    background: #eceef0;
}
.hu-color-picker.light .color-type .name {
    background: #e7e8e9;
}
.hu-color-picker.light .color-type .value {
    color: #666;
    background: #eceef0;
}
.hu-color-picker.light .colors.history {
    border-top: 1px solid #eee;
}
.hu-color-picker canvas {
    vertical-align: top;
}
.hu-color-picker .color-set {
    display: flex;
}
.hu-color-picker .color-show {
    margin-top: 8px;
    display: flex;
}
</style>