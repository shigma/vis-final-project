const MAXL = 27;
module.exports = {
    initTree(tree){
        tree = [];
        let tmp = new Object();
        tmp.kid = new Array(MAXL);
        for (let i=0; i<MAXL; i++) tmp.kid[i] = -1;
        tmp.pre = 0;
        tmp.dangerous = false;
        tmp.fstr = [];
        tree.push(tmp);

        tmp = new Object();
        tmp.kid = new Array(MAXL);
        for (let i=0; i<MAXL; i++) tmp.kid[i] = -1;
        tmp.pre = 0;
        tmp.dangerous = false;
        tmp.fstr = [];
        tree.push(tmp);
        return tree;
    },
    insert(tree, str, strid){
        str = ' '+str+' ';
        let p = 1;
        for (let i=0; str[i]; i++){
            let si = str[i].charCodeAt();
            if (si>=65 && si<=90) si = si - 65;
            else if (si>=97 && si<=122) si = si - 97;
            else si = MAXL-1;

            //console.log(p);
            //console.log(JSON.stringify(tree[p]));
            //console.log(tree[p].kid[si]);

            if (tree[p].kid[si]===-1){
                tree[p].kid[si] = tree.length;
                //console.log('len');
                let tmp = new Object();
                tmp.kid = new Array(MAXL);
                for (let ii=0; ii<MAXL; ii++) tmp.kid[ii] = -1;
                tmp.dangerous = false;
                tmp.fstr = [];
                tmp.pre = 0;
                tree.push(tmp);
            }
            p = tree[p].kid[si];
        }
        //console.log(p);
        tree[p].dangerous = true;
        tree[p].fstr.push(strid);
        return tree;
    },
    BuildSA(tree){
        for (let i=0; i<MAXL; i++){
            tree[0].kid[i] = 1;
        }
        tree[0].pre = -1;
        tree[1].pre = 0;
        //console.log(JSON.stringify(tree));
        let que = [];
        que.push(1);
        while (que.length!==0){
            let p = que.shift();
            //console.log('out '+p);
            //console.log(JSON.stringify(tree[p]));
            for (let i=0; i<MAXL; i++){
                let q = tree[p].kid[i];
                if (q!==-1){
                    let pre = tree[p].pre;
                    while (tree[pre].kid[i]===-1){
                        pre = tree[pre].pre;
                    }
                    tree[q].pre = tree[pre].kid[i];
                    if (tree[tree[q].pre].dangerous){
                        tree[q].dangerous = true;
                    }
                    que.push(q);
                    //console.log('in ' + q);
                }
            }
        }
        return tree;
    },
    searchDFA(tree, str, ret){
        str = str + ' ';
        let p = 1;
        for (let i=0; str[i]; i++){
            let si = str[i].charCodeAt();
            if (si>=65 && si<=90) si = si - 65;
            else if (si>=97 && si<=122) si = si - 97;
            else si = MAXL-1;
            
            while (tree[p].kid[si]===-1){
                p = tree[p].pre;
            }
            p = tree[p].kid[si];
            //console.log(p);
            if (tree[p].dangerous){
                //console.log(i+' '+p)
                let tmp = p;
                while (tree[tmp].dangerous){
                    let size = tree[tmp].fstr.length;
                    //console.log('size= '+tree[tmp].fstr);
                    for (let j=0; j<size; j++){
                        //console.log(tree[tmp].fstr[j]);
                        ret[tree[tmp].fstr[j]]++;
                        //console.log('add' + ret[0]);
                    }
                    tmp = tree[tmp].pre;
                }
                //console.log(JSON.stringify(ret));
            }
        }
        return ret;
    }
}

// for test
/*
let teststr = ['aab', 'aa', 'bba'];
let testmstr = 'aabbbaabab';
let t = [];
t = initTree(t);

//console.log('t = ' + JSON.stringify(t)+'\n');
let sizestr = teststr.length;
for (let i=0; i<sizestr; i++){
    t = insert(t, teststr[i], i);
}
//console.log(JSON.stringify(t));
console.log('insert finish\n');
t = BuildSA(t);
//console.log(JSON.stringify(t));
console.log('Build finish\n');
let ans = [];
for (let i=0; i<sizestr; i++){
    ans[i] = 0;
}
ans = searchDFA(t, testmstr, ans);
console.log('ret=' + JSON.stringify(ans));
*/