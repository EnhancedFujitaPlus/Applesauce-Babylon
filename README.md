Hello! This is v0.0.14! What you got here is a open source skateboarding game!
-with lots of blood and gore
--and lots of different documentation that can explain how it was built and how to expand it out into your own game!
|\|\|\|\|\|\|\|\|\|\|\|\|\|\|\|\|\|\|\|\|\|\|\|\|\|\\\||||\\\|\\\\||\\\|||||\\\\||\\|||||\\\\\||\\\||\\|||\\||\\\||\
---All music in the game comes from South of South Records
----Coding teaching by Claude.AI, all ideas, music, and other art is human made.
-----reverse engineered SR-71


//deadair



Applesauce was built using two main javascript libraries, Three.js and Babylon.js.

Currently must use a Live Server via Visual Studio Code (VSC) add-on. Once installed, you are able to right-click
to open html files inside of VSC. This is currently how to play the game to comply with CORS pPolicy.

Three.js is easy mode Babylon.js is hard mode. Start in chapter 1. Or not idfc

Thanks for checking it out!

index.html is the main menu.

If it doesn't work you might have to run the level htmls directly

if it doesnt work it might not be done yet__________________
----\_________________________________________________/==|_|
--------\|   |  |       |               |          |=====|/
------------\|  |     \ | /    q_p    \ | /        |=====||
---------------\|      &6&             090         |=====||
----------------------/---\-----------/-{-\-----+++|=====||
-----------------------------------------{-------+-|=====||
=========================================================||
The game is about getting people to wear a helmet, and the human nature of technological advancements.

bro just wear your helmet 
-------------------------------------------------------


Q/A

Q: Why so many html in the Root?
A: each level has shifted into having its own engine. The original concept of 1 singular "core" being able to handle the constant upgrades and level specific details. This createss a system where both the index and level HTML are in the same directory, to create a more smoother transition going UP instead of UP then Down and then back up with folder locations. The "correct" folder structure types will usually bring me errors of either level configs type of files not being able to work since its not in the same directory, or mainly right now Im running into the issues of the babylon or three files not imported correctly. Much of the game dev so far has been trying to figure out imports that follow security policies, but also my most common error by far is "cannot find module.js" "check if in the same directory". But I also have to ensure that the other core engines bits are also in the same directory? You have to use the same library (cant have 1 babylon in one deep folder while using one in the engine folder). Will the HTMLs change into a /levels folder again? Maybe? But it just turned into a level+configs+bits of engines. idk. 

Q: Would you eat a baby?
A: no way

Q: Would you eat a babylon?
A: If its optimized. Right now Im figuring out the terrain codes. Check out this difference from Three.js to Babylon.
-------------------------------------------------------------------------------------------
three terrain code example
generateHillHeightData(segment, startZ) {
        const data = [];
        const length = segment.length || this.chunkSize;
        const width = segment.width || 200;
        const startHeight = segment.startHeight || 60;
        const endHeight = segment.endHeight || 0;
        const resolution = 2; // Higher resolution for hills
        
        for (let x = -width / 2; x <= width / 2; x += resolution) {
            for (let z = startZ; z <= startZ + length; z += resolution) {
                const normalizedZ = (z - startZ) / length;
                const height = startHeight + (endHeight - startHeight) * normalizedZ;
                
                // Width variation
                const widthFactor = 1 - Math.abs(x / (width / 2)) * 0.2;
                const finalHeight = height * widthFactor;
                
                data.push({ x, y: finalHeight, z });
            }
        }
        
        return data;
    }

    -----------------------------------------------------------------------------------
baby terrain code example
/**
     * Simple seeded hash noise for extra terrain detail.
     * Deterministic: same (x,z) always returns the same value.
     */
    _hashNoise(x, z) {
        const xi = Math.floor(x);
        const zi = Math.floor(z);
        const xf = x - xi;
        const zf = z - zi;
        
        const hash = (a, b) => {
            let h = this._noiseSeed + a * 374761393 + b * 668265263;
            h = (h ^ (h >> 13)) * 1274126177;
            return (h ^ (h >> 16)) / 2147483648.0;
        };
        
        const n00 = hash(xi, zi);
        const n10 = hash(xi + 1, zi);
        const n01 = hash(xi, zi + 1);
        const n11 = hash(xi + 1, zi + 1);
        
        const u = xf * xf * (3 - 2 * xf);
        const v = zf * zf * (3 - 2 * zf);
        
        const nx0 = n00 * (1 - u) + n10 * u;
        const nx1 = n01 * (1 - u) + n11 * u;
        
        return nx0 * (1 - v) + nx1 * v;
    }

This isn't to say that three.js isn't complex, but how babycode will turn into extra hard mode with further definitions is fascinating and just takes a lot of looking at code and figuring out how does what?

Q: Isnt java a joke? Why make a game on it?
A: I havent found a solid reason not to use java compared to larger game engines (for this project). The discovery of Babylon.js helped center me back into what I actually needed. HTML allows both PC and Mobile to load the same exact level. This feature is what made older, deeply complex games have to shift engines away from java, only to use a propriotary "mobile" based game engine regardless to deal with multiplayer. Once the game is in a more solid state drive, im going to expirment with different types of multiplayer that isn't just "release game on Stteam/GOG/uPlay/Origin(deadshitEAApp)/Epic Store/ why not convenience store?

Enjoy!

