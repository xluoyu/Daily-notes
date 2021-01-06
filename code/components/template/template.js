
function Template(el) {
    if (!this.container) {
        this.container = document.querySelector(el)
        this.TemplateElement = null
        this.propsMap = ['disabled', 'hidden', 'checked', 'selected', 'required', 'open', 'readonly'];
    }
}

Template.prototype.mount = function (data) {
    if (this.container) {
        if (this.container.innerHTML) {
            this.setDom(this.container, this.render(data).content)
        } else {
            this.container.innerHTML = this.render(data).innerHTML
        }
    } else {
        throw new Error('没有找到容器')
    }
}

Template.prototype.render = function (data) {
    if (!this.TemplateElement) {
        this.TemplateElement = document.querySelector('#template')
    }
    
    const rule = this.TemplateElement.getAttribute("rule") || '$';
    this.$fragment = this.TemplateElement.cloneNode(true)
    this.fragment = document.createElement('TEMPLATE')

    // for 循环渲染
    const repeatEls = this.$fragment.content.querySelectorAll(`[\\${rule}for]`);
    repeatEls.forEach(el => {
        const strFor = el.getAttribute(`${rule}for`)
        const {isArray, items, params} = parseFor(strFor)
        el.before('${Object.entries(' + items + ').map(function([' + `${(isArray ? '$index$' : (params[1] || 'name'))},${params[0] || (isArrray ? 'item' : 'value')}],${params[2] || 'index'}` + '){ return `')
        el.removeAttribute(`${rule}for`)
        el.after('`}).join("")}')
    });

    // if 条件判断
    const ifELs = this.$fragment.content.querySelectorAll(`[\\${rule}if]`);
    ifELs.forEach(el => {
        const ifs = el.getAttribute(`${rule}if`)
        el.before('${' + ifs + '?`')
        el.removeAttribute(`${rule}if`)
        el.after('`:`<!--if:' + el.tagName + '-->`}')
    })

    this.fragment.innerHTML = interpolate(this.$fragment.innerHTML,data)
    const propsEls = this.fragment.content.querySelectorAll(`[${this.propsMap.join('],[')}]`);
    propsEls.forEach(el => {
        this.propsMap.forEach(props => {
            if (el.getAttribute(props) === 'false') {
                el.removeAttribute(props)
            }
        })
    })

    return this.fragment
}

const parseFor = function (strFor) {
    const isObj = strFor.includes (' of ');
    const reg = /\s(?:in|of)\s/g
    // "(item, index) in items" => ["(item, index)", "items"]
    const [keys, obj] = strFor.match(reg) ? strFor.split(reg) : ["item", strFor]
    const items = Number(obj) > 0 ? `[${'null,'.repeat(Number(obj) - 1)}null]` : obj;
    const params = keys.split(/[\(|\)|, \s?]/g).filter(Boolean)
    return {isArray: !isObj, items, params}
}

const interpolate = function (str, params) {
    const names = Object.keys(params)
    const vals = Object.values(params)
    str = str.replace(/\{\{([^\}]+)\}\}/g, (all,s) => `\${${s}}`)
    return new Function(...names, `return \`${escape2Html(str)}\`;d`)(...vals)
}

const escape2Html = function (str) {
    var arrEntities = {'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"'}
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) {
        return arrEntities[t]
    })
}

Template.prototype.setDom = function (container, html) {
    const patches = diff(container, html)
    console.log(patches)
    patches.forEach(item => {
        switch (item.type) {
            case 'REMOVE':
                item.el.remove()
                break
            case 'TEXT':
                item.el.textContent = item.text
                break
            case 'ATTRS':
                item.attrs.forEach(attr => {
                    if ((this.propsMap.includes(attr.name) && attr.value === 'false') || !attr.value) {
                        item.el.removeAttribute(attr.name)
                    } else {
                        item.el.setAttribute(attr.name, attr.value)
                    }
                })
                break
            case 'REPLACE':
                item.el.replaceWith(item.newNode)
                break
            case 'ADD':
                item.el.appendChild(item.newNode)
                break
            case 'SORT':
                item.el.append(...item.newNode)
                break
            default:
                break
        }
    })
}

const diff = function (container, html) {
    const patches = []
    const newNode = html2Node(html);
    diffNodes(container.childNodes, newNode.childNodes, patches, container)
    return patches
}

// diff 子节点比较
const diffNodes = function (oldNodes, newNodes, patches, oldNode) {
    const oldChildren = Array.from(oldNodes)
    const newChildren = Array.from(newNodes)

    const oldKey = oldChildren.map(el => el.nodeType === Node.ELEMENT_NODE ? el.getAttributeNode('key') : null).filter(Boolean);
    const newKey = newChildren.map(el => el.nodeType === Node.ELEMENT_NODE ? el.getAttributeNode('key') : null).filter(Boolean);

    // 针对有key的情况(for循环)
    if (oldKey.length > 0) {
        oldKey.forEach((keynode, idx) => {
            // 如果新节点中没有旧节点的key， 就移除旧节点
            if (!newKey.find(el => el.value == keynode.value)) {
                console.log('移除节点', keynode)
                oldKey.splice(idx, 1)
                patches.push({
                    type: 'REMOVE',
                    el: keynode.ownerElement
                })
            }
        })
        
        newKey.forEach(keynode => {
            if (!oldKey.find(el => el.value === keynode.value)) {
                oldKey.push(keynode)
            }
        })
            
        const sort = newKey.map(el => el.value)

        oldKey.sort((a, b) => sort.indexOf(a.value) - sort.indexOf(b.value))
    
        patches.push({
            type: 'SORT',
            newNode: oldKey.map(el => el.ownerElement),
            el: oldNode
        })
        
        newKey.forEach((keynode, idx) => {
            const newNode = keynode.ownerElement
            const oldNode = oldKey[idx].ownerElement
            if (!oldNode.isEqualNode(newNode)) {
                walk(oldNode, newNode, patches)
            }
        })
    } else {
        // 比较旧的每一项
        oldChildren.forEach((child, idx) => {
            if (!child.isEqualNode(newChildren[idx])) {
                walk(child, newChildren[idx], patches)
            }
        })

        // 新增节点
        newChildren.forEach((child, idx) => {
            if (!oldChildren[idx]) {
                patches.push({
                    type: 'ADD',
                    newNode: child,
                    el:oldNode
                })
            }
        })
    }
}

function walk(oldNode, newNode, patches) {
    const currentPatch = []
    if (!newNode) {
        // 没有新节点就删除
        currentPatch.type = 'REMOVE'
        currentPatch.el = oldNode
    } else if (oldNode.nodeType === Node.TEXT_NODE && newNode.nodeType === Node.TEXT_NODE) {
        // 如果是文本节点
        if (oldNode.textContent.replace(/\s/g, '') !== newNode.textContent.replace(/\s/g, '')) {
            currentPatch.type = 'TEXT'
            currentPatch.el = oldNode
            currentPatch.text = newNode.textContent
        }
    } else if (oldNode.nodeType === newNode.nodeType && newNode.nodeType === Node.ELEMENT_NODE) {
        // 比较属性
        const attrs = diffAttr(oldNode, newNode)
        if (attrs.length > 0) {
            currentPatch.type = 'ATTRS'
            currentPatch.el = oldNode
            currentPatch.attrs = attrs
        }
        diffNodes(oldNode.childNodes, newNode.childNodes, patches, oldNode)
    } else {
        // 节点被替换
        currentPatch.type = 'REPLACE'
        currentPatch.newNode = newNode
        currentPatch.el = oldNode
    }
    if (currentPatch.type) {
        patches.push(currentPatch)
    }
}

function diffAttr (oldNode, newNode) {
    const patch = []
    const oldAttrs = Array.from(oldNode.attributes)
    const newAttrs = Array.from(newNode.attributes)

    // 查看是否有改动的
    oldAttrs.forEach(attr => {
        const newAttr = newNode.getAttribute(attr.name) || {name: attr.name, value: null}
        if (attr.value !== newAttr.value) {
            patch.push(newAttr)
        }
    })
    // 查看是否有新增的
    newAttrs.forEach(attr => {
        if (!oldAttrs.find(el => el.name == attr.name)) {
            patch.push(attr)
        }
    })
    return patch
}

function html2Node(html) {
    return html.nodeType ? html : document.createRange().createContextualFragment(html);
}