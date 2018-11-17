if(window.isDot2())
{
    window.remoteColors = {
        presetValues: {
            Value: {
                borderColor: "#FFFF00",
                activeBackgroundColor: "#555500"
            },
            Output: {
                borderColor: "#FFFF00",
                activeBackgroundColor: "#555500"
            }
        },
        button: {
            backgroundColor: "#000",
            backgroundColorPressed: "#3B2B00",
            strokeColor: "#505050"
        },
        scrollBar: {
            backgroundColor : "#4C4C4C",
            backgroundColorPressed: "#4C4C4C",
            strokeColor:"#B2B2B2"
        },
        commandLine: {
            color: "#FFF"
        },
        ma2Window: {
            backgroundColor: "#1A1A1A",
            strokeColor: "#808080",
        },
        canvasContainer: {
            fillColor: "#000",
            color: "#FFF",
            cell: {
                backgroundColor: "#505050",
                strokeColor: "#CCC",
                focusBorderColor: "#FFF",
            }
        },
        fixtureSheet: {
            cellBackgroundColor: "#202020",
            cellBackgroundColor2: "#282828",
            headerCellBackgroundColor: "#393939",
            headerSelectedAttributeColor: "#FFF",
            headerSelectedPresetColor: "#FFF",
            focusBorderColor: "#FFF",
            borderColor: "#000"
        },
        fixtureLayoutSheet: {
            cellBackgroundColor: "#000",
        },
        commandHistory: {
            backgroundColor: "#1A1A1A",
            fillStyle: "#333",
            lineBackgroundColor: "#000",
            color: "#BBBBBB"
        },
        pools: {
            cell: {
                backgroundColor: "#404040",
                color: "#FFF",
                selectedColor: "#FFFF00",
                border: {
                    color: "#404040",
                    focusColor: "#FFF"
                },
                index: {
                    color: "#A0A0A0",
                    referencedColor: "#A0A0A0"
                },
                stateStripe: {
                    color: "#404040"
                }
            }
        },
        groupPool: {
            cell: {
            }
        },
        macroPool: {
            cell: {
            }
        },
        presetPool: {
            cell: {
                amountOfUsed : {
                    color: "#404040"
                },
                dimmer: {
                    backgroundColor: "#808080",
                    color: "#E8A900"
                },
                miscRects: [
                    {
                        color: "#FF0"
                    },
                    {
                        color: "#0F0"
                    },
                    {
                        color: "#E8A900"
                    },
                    {
                        color: "#FF80FF"
                    },
                ]
            }
        },
        executorSheet: {
            headerCellBackgroundColor: "#393939",
            cellBackgroundColor: "#646464",
            cellBackgroundColor2: "#7D7D7D",
            headerSelectedAttributeColor: "#F8FC00",
            headerSelectedPresetColor: "#B4B400",
            headerBorderColor: "#CE9703",
            borderColor: "#000000",
            borderColorAlternative: "#404040",
            selectedBorderColor: "#FF0"
        },
    };
}
else
{
    window.remoteColors = {
        presetValues: {
            Value: {
                borderColor: "#FFFF00",
                activeBackgroundColor: "#555500"
            },
            Fade: {
                borderColor: "#00FF00",
                activeBackgroundColor: "#006F00"
            },
            Delay: {
                borderColor: "#E8A901",
                activeBackgroundColor: "#664A00"
            },
            Output: {
                borderColor: "#E8A901",
                activeBackgroundColor: "#664A00"
            }
        },
        button: {
            backgroundColor: "#000",
            backgroundColorPressed: "#3B2B00",
            strokeColor: "#E0A302"
        },
        scrollBar: {
            backgroundColor : "#000",
            backgroundColorPressed: "#3B2B00",
            strokeColor:"#E0A302"
        },
        commandLine: {
            color: "#FFF"
        },
        ma2Window: {
            backgroundColor: "#1A1A1A",
            buttonsBackgroundColor: "#000",
            strokeColor: "#E0A302",
        },
        canvasContainer: {
            fillColor: "#000",
            color: "#FFF",
            cell: {
                backgroundColor: "#505050",
                strokeColor: "#CCC",
                focusBorderColor: "#00F",
            }
        },
        fixtureSheet: {
            cellBackgroundColor: "#000030",
            headerSelectedAttributeColor: "#F8FC00",
            headerSelectedPresetColor: "#B4B400"
        },
        channelSheet: {
            cell: {
                backgroundColor: "#000030",
                color: "#FFF",
                border: {
                    color: "#FFF",
                    focusedColor: "#00F",
                }
            }
        },
        commandHistory: {
            backgroundColor: "#1A1A1A",
            fillStyle: "#333",
            lineBackgroundColor: "#000",
            color: "#BBBBBB"
        },
        pools: {
            cell: {
                backgroundColor: "#000",
                color: "#FFF",
                topHalf: {
                    backgroundColor: "#000"
                },
                bottomHalf: {
                    backgroundColor1: "#3F3F3F",
                    backgroundColor2: "#616161"
                },
                border: {
                    color: "#808080",
                    focusColor: "#00F"
                },
                index: {
                    color: "#8F8F8F",
                    referencedColor: "#0DDDD1"
                },
                stateStripe: {
                    color: "#808080"
                }
            }
        },
        groupPool: {
            cell: {
                miscRects: {
                    color: "#F00"
                }
            }
        },
        macroPool: {
            cell: {

            }
        },
        presetPool: {
            cell: {
                borderColor: "#FF0",
                amountOfUsed : {
                    color: "#0DDDD1"
                },
                dimmer: {
                    backgroundColor: "#808080",
                    color: "#E8A900"
                },
                specialChars: [
                    {
                        color: "#F00"
                    },
                    {
                        color: "#E8A900"
                    },
                    {
                        color: "#C0C0C0"
                    },
                    {
                        color: "#FFF"
                    },
                ],
                miscRects: [
                    {
                        color: "#FF0"
                    },
                    {
                        color: "#0F0"
                    },
                    {
                        color: "#E8A900"
                    },
                    {
                        color: "#FF80FF"
                    },
                ]
            }
        },
        worldPool: {
            cell: {
                backgroundColor: "#000",
                filledColor: "#FFF",
                emptyColor: "#888"
            }
        },
        executorSheet: {
            headerCellBackgroundColor: "#000",
            cellBackgroundColor: "#606060",
            headerSelectedAttributeColor: "#F8FC00",
            headerSelectedPresetColor: "#B4B400",
            headerBorderColor: "#CE9703",
            borderColor: "#000000",
            borderColorAlternative: "#404040",
            selectedBorderColor: "#FF0"
        },
    };
}
