declare namespace weex {
// 表示类型待定
  type Unknown = any;

  interface NodeConstructor {
    new(): Node;
  }

  interface Node {
    // 初始化设置的
    nodeId: string;// 初始化内部自动生成
    ref: string;// 是节点的 nodeId 的引用
    children: Array<Unknown>;
    pureChildren: Array<Unknown>;
    parentNode: Unknown | null;// 父节点
    nextSibling: Unknown | null;// 下一个兄弟节点
    previousSibling: Unknown | null;// 上一个兄弟节点

    // 后期设置的，{@see Element#appendChild}
    docId?: Unknown;// 所属 document 的 ID
    ownerDocument?: Unknown;
    depth?: number;

    /**
     * Destroy current node, and remove itself form nodeMap.
     * 删除当前节点的 docId，自 document 的 nodeMap 中删除此节点，
     * 同时会执行子节点的 destroy 函数。
     */
    destroy(): void;
  }


  interface CommentConstructor {
    new(value: Unknown): Comment;
  }

  interface Comment extends Node {
    // 初始化设置的
    nodeType: 8;
    type: 'comment';
    value: Unknown;

    /**
     * Convert to HTML comment string.
     */
    toString(): string;
  }


  interface ElementConstructor {
    new(type?: string, props?: Unknown, isExtended?: boolean): Element | WeexElement;
  }

  interface Element extends Node {
    // 初始化设置的
    nodeType: 1;
    type: string;
    attr: Record<Unknown, Unknown>;// props.attr || {}
    style: Record<Unknown, Unknown>;// props.style || {}
    classStyle: Record<Unknown, Unknown>;// props.classStyle || {}
    event: Record<Unknown, Unknown>;// {}

    /**
     * Append a child node.
     *
     * 1、如果指定 node 的 parentNode, 且 node.parentNode !== this，则返回 undefined;
     * 2、如果没有指定 node 的 parentNode，则为当前实例指定 node.parentNode = this，同时设置以下属性：
     *       node.docId = this.docId
     *       node.ownerDocument = this.ownerDocument
     *       node.ownerDocument.nodeMap[node.nodeId] = node
     *       node.depth = this.depth + 1
     *    同时为 node 的子节点设置上述属性，然后设置 previousSibling 和 nextSibling，
     *    这个时候**可能会** 调用 document 的 taskCenter， 发送 dom 的 addElement 任务；
     * 3、如果为 node 指定 parentNode，则 patch 子节点，这个时候**可能会** 调用 document 的 taskCenter，
     *    发送 dom 的 moveElement 任务。
     *
     * @param {object} node 应该是一个 Node 类型
     * @return {undefined | number} the signal sent by native （taskCenter的任务信号）
     */
    appendChild(node: Node): number | undefined;

    /**
     * Insert a node before specified node.
     *
     * 1、如果指定 node 的 parentNode, 且 node.parentNode !== this，则返回 undefined;
     * 2、如果 node === before || (node.nextSibling && node.nextSibling === before)，则返回 undefined;
     * 3、如果不指定 node 的 parentNode，会将 node 插入到 document 的 DOM 树中，**可能会**
     *    调用 document 的 taskCenter， 发送 dom 的 addElement 任务；
     * 4、如果指定 node 的 parentNode，则移动其位置，**可能会**调用 document 的 taskCenter， 发送 dom 的 moveElement 任务；
     *
     * @param {object} node
     * @param {object} before
     * @return {undefined | number} the signal sent by native （taskCenter的任务信号）
     */
    insertBefore(node: Node, before: Node): number | undefined;

    /**
     * Insert a node after specified node.
     *
     * @see Element#insertBefore
     *
     * @param {object} node
     * @param {object} after
     * @return {undefined | number} the signal sent by native （taskCenter的任务信号）
     */
    insertAfter(node: Node, after: Node): number | undefined;

    /**
     * Remove a child node, and decide whether it should be destroyed.
     *
     * **可能会**调用 document 的 taskCenter， 发送 dom 的 removeElement 任务。
     *
     * @param {object} node
     * @param {boolean} preserved 值为假时，会执行 node.destroy()
     */
    removeChild(node: Node, preserved: boolean): void;

    /**
     * Clear all child nodes.
     *
     * 1、**可能会**调用 document 的 taskCenter， 发送 dom 的 removeElement 任务。
     * 2、如果存在子节点，则会执行其子节点的 destroy 方法。
     */
    clear(): void;

    /**
     * Set an attribute, and decide whether the task should be send to native.
     *
     * **可能会**调用 document 的 taskCenter， 发送 dom 的 updateAttrs 任务。
     *
     * @param {string} key
     * @param {string | number} value
     * @param {boolean} silent 是否静默模式，开启了就不会触发 updateAttrs 任务
     */
    setAttr(key: string, value: string | number, silent: boolean): void;

    /**
     * Set batched attributes.
     *
     * **可能会**调用 document 的 taskCenter， 发送 dom 的 updateAttrs 任务。
     *
     * @param {object} batchedAttrs
     * @param {boolean} silent 是否静默模式，开启了就不会触发 updateAttrs 任务
     */
    setAttrs(batchedAttrs: Record<string, string | number>, silent: boolean): void;

    /**
     * Set a style property, and decide whether the task should be send to native.
     *
     * **可能会**调用 document 的 taskCenter， 发送 dom 的 updateStyle 任务。
     *
     * @param {string} key
     * @param {string | number} value
     * @param {boolean} silent 是否静默模式，开启了就不会触发 updateStyle 任务
     */
    setStyle(key: string, value: string | number, silent: boolean): void;

    /**
     * Set batched style properties.
     *
     * **可能会**调用 document 的 taskCenter， 发送 dom 的 updateStyle 任务。
     *
     * @param {object} batchedStyles
     * @param {boolean} silent 是否静默模式，开启了就不会触发 updateStyle 任务
     */
    setStyles(batchedStyles: Record<string, string | number>, silent: boolean): void;

    /**
     * Set style properties from class.
     *
     * 设置通过 class 定义的属性，**可能会**调用 document 的 taskCenter，
     * 发送 dom 的 updateStyle 任务。
     *
     * @param {object} classStyle
     */
    setClassStyle(classStyle: Record<string, Unknown>): void;

    /**
     * Add an event handler.
     *
     * **可能会**调用 document 的 taskCenter，发送 dom 的 addEvent 任务。
     *
     * @param {string} type
     * @param {function} handler
     * @param {*} params 可能是 handler 的参数列表。
     */
    addEvent(type: string, handler: Function, params: Unknown): void;

    /**
     * Remove an event handler.
     *
     * **可能会**调用 document 的 taskCenter，发送 dom 的 removeEvent 任务。
     *
     * @param {string} type
     */
    removeEvent(type: string): void;

    /**
     * ?????
     * Fire an event manually.
     * @param {string} type type
     * @param {function} event handler
     * @param {boolean} isBubble whether or not event bubble
     * @param {boolean} options
     * @return {} anything returned by handler function
     */
    fireEvent(type, event, isBubble, options): Unknown;

    /**????
     * Get all styles of current element.
     * @return {object} style
     */
    toStyle(): Record<string, Unknown>;

    /**?????
     * Convert current element to JSON like object.
     * @return {object} element
     */
    toJSON(): Unknown;

    /**
     * Convert to HTML element tag string.
     */
    toString(): string;
  }
}
