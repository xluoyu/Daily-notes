function Template(el, templateEl, data) {
  this.propsMap = ['disabled', 'hidden', 'checked', 'selected', 'required', 'open', 'readonly'];
  this.container = document.querySelector(el)
  this.TemplateElement = document.querySelector(templateEl)
  if (!this.container) throw new Error('没有找到容器')
  if (!this.TemplateElement) throw new Error('没有找到模板')
  this.initData(data)
  this.container.innerHTML = this.render(data).innerHTML
}

Template.prototype = {
  initData (data) {
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key)
    })
  },
  defineReactive (obj, key) {
    // const dep = new Dep()
    let value = obj[key]
    let that = this
    Object.defineProperty(obj, key, {
      get () {
        return value
      },
      set (newValue) {
        value = newValue
        that.setDom(that.render(data).content)
      }
    })
  },
  render (data) {
    // 先进行拷贝
    this.$fragment = this.TemplateElement.cloneNode(true)
    this.fragment = document.createElement('TEMPLATE')

    // for
    const forEls = this.$fragment.content.querySelectorAll('[\\$for]')
    forEls.forEach(el => {
      const forVal = el.getAttribute('$for')
      const {isArray, items, params} = parseFor(forVal)
      el.before('${Object.entries(' + items + ').map(function([' + `${(isArray ? '$index$' : (params[1] || 'name'))},${params[0] || (isArrray ? 'item' : 'value')}],${params[2] || 'index'}` + '){ return `')
      el.removeAttribute(`$for`)
      el.after('`}).join("")}')
    })

    // if
    const ifEls = this.$fragment.content.querySelectorAll('[\\$if]')
    ifEls.forEach(el => {
      const ifVal = el.getAttribute('$if')
      /**
       * 将当前dom改为
       * ${ ifVal ? el : <!--if:el.tagName-->}
       * 使用三目运算，在后续new Function时执行进行判断
       */
      el.before('${' + ifVal + '?`')
      el.removeAttribute(`$if`)
      el.after('`:`<!--if:' + el.tagName + '-->`}')
    })
    this.fragment.innerHTML = interpolate(this.$fragment.innerHTML, data)
    return this.fragment
  },
  setDom (html) {
    const patches = []
    diff(this.container.childNodes, html.childNodes, patches, this.container)

    patches.forEach(item => {
      switch (item.type) {
        case 'TEXT':
          item.el.textContent = item.text
          break
        case 'REMOVE':
          item.el.remove()
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
        case 'ADD':
          item.el.appendChild(item.newNode)
          break
        case 'REPLACE':
          item.el.replaceWith(item.newNode)
          break
        default:
          break
      }
    })
  }
}

const parseFor = function (strFor) {
  const isObj = strFor.includes (' of ')
  const reg = /\s(?:in|of)\s/g
  // "(item, index) in items" => ["(item, index)", "items"]
  /**
   * 使用 in/of 进行拆分
   * 如果没有in/of，则使用默认
   */
  const [keys, obj] = strFor.match(reg) ? strFor.split(reg) : ["item", strFor]
  const items = obj
  const params = keys.split(/[\(|\)|, ?]/g).filter(Boolean)
  return {isArray: !isObj, items, params}
}

const interpolate = function (str, params) {
  let keys = Object.keys(params)
  let value = Object.values(params)
  str = str.replace(/\{\{([^\}]+)\}\}/g, (all,s) => `\${${s}}`) // 将{{}} => ${}
  /**
   * 将template模板转为`asd ${}`形式的字符串
   * 通过function进行拼接
   */
  return new Function(...keys, `return \`${escape2Html(str)}\`;d`)(...value)
}

const escape2Html = function (str) {
  var arrEntities = {'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"'}
  return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) {
      return arrEntities[t]
  })
}

const diff = function(oldNode, newNode, patches, container) {
  const oldChildren = Array.from(oldNode)
  const newChildren = Array.from(newNode)
  // const oldKey = oldChildren.map(el => el.nodeType === Node.ELEMENT_NODE ? el.getAttributeNode('key') : null).filter(Boolean);
  // const newKey = newChildren.map(el => el.nodeType === Node.ELEMENT_NODE ? el.getAttributeNode('key') : null).filter(Boolean);
  // console.log(oldKey)
  // console.log(oldChildren)

  oldChildren.forEach((child, index) => {
    // 检测两个节点是否相等，该api会检测节点名、值、所有后代节点
    if (!child.isEqualNode(newChildren[index])) {
      // 又不相同的、进入详细检测
      walk(child, newChildren[index], patches)
    }
  })

  // 查询新增节点
  newChildren.forEach((child,index) => {
    // 如果旧节点没有改节点
    if (!oldChildren[index]) {
      patches.push({
        type: 'ADD',
        newNode: child,
        el: container
      })
    }
  })
}

// 详细的diff
const walk = function(oldNode, newNode, patches) {

  let currentPatch = {}
  if (!newNode) {
    // 没有新节点 -> 删除
    currentPatch = {
      type: 'REMOVE',
      el: oldNode
    }
  } else if (oldNode.nodeType === Node.TEXT_NODE && newNode.nodeType === Node.TEXT_NODE) {
    // 如果两方都是文本节点
    if (oldNode.textContent.replace(/\s/g, '') !== newNode.textContent.replace(/\s/g, '')) {
      currentPatch = {
        type: 'TEXT',
        el: oldNode,
        text: newNode.textContent
      }
    }
  } else if (oldNode.nodeType === newNode.nodeType && newNode.nodeType === Node.ELEMENT_NODE) {
    // 标签节点、检查属性
    const attrs = diffAttr(oldNode, newNode)
    if (attrs.length) {
      currentPatch = {
        type: 'ATTRS',
        el: oldNode,
        attrs: attrs
      }
    }
    // 深层diff子类
    diff(oldNode.childNodes, newNode.childNodes, patches, oldNode)
  } else {
    currentPatch = {
      type: 'REPLACE',
      el: oldNode,
      newNode: newNode
    }
  }

  if (currentPatch.type) {
    patches.push(currentPatch)
  }
}

const diffAttr = function (oldNode, newNode) {
  const patch = []
  const oldAttrs = Array.from(oldNode.attributes)
  const newAttrs = Array.from(newNode.attributes)

  oldAttrs.forEach(attr => {
    const newAttrValue = newNode.getAttribute(attr.name) || null
    if (attr.value !== newAttrValue) {
      patch.push({
        name: attr.name,
        value: newAttrValue
      })
    }
  })

  newAttrs.forEach(attr => {
    if (!oldAttrs.find(e => e.name == attr.name)) {
      patch.push(attr)
    }
  })

  return patch
}