                      <List.Item.Meta
                        avatar={<Avatar icon={<NodeIndexOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                        title={path.title}
                        description={
                          <Text type="secondary">
                            {subjects.find(s => s.id === path.subject)?.name || path.subject}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无收藏的学习路径" />
              )}
            </Card>
            
            <Card title="AI路径生成" style={{ marginTop: 16 }}>
              <Paragraph>
                使用AI快速生成个性化学习路径，只需提供学科、主题和学习目标。
              </Paragraph>
              <Button 
                type="primary" 
                icon={<RobotOutlined />} 
                block
                onClick={() => setAiModalVisible(true)}
              >
                AI生成学习路径
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // 渲染学生进度标签页
  const renderStudentProgressTab = () => {
    return (
      <div className="student-progress-container">
        <Row gutter={16}>
          <Col span={16}>
            <Card>
              <Table
                dataSource={students}
                columns={[
                  {
                    title: '学生',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text, record) => (
                      <Space>
                        <Avatar icon={<UserOutlined />} src={record.avatar} />
                        <Text>{text}</Text>
                      </Space>
                    )
                  },
                  {
                    title: '当前学习路径',
                    dataIndex: 'currentPath',
                    key: 'currentPath',
                    render: (_, record) => {
                      const path = learningPaths.find(p => 
                        p.assignments && p.assignments.some(a => 
                          a.studentId === record.id && a.status === 'active'
                        )
                      );
                      return path ? path.title : '-';
                    }
                  },
                  {
                    title: '进度',
                    key: 'progress',
                    render: (_, record) => {
                      const assignment = learningPaths
                        .flatMap(p => p.assignments || [])
                        .find(a => a.studentId === record.id && a.status === 'active');
                      
                      return assignment ? (
                        <Progress 
                          percent={assignment.progress} 
                          size="small" 
                          status={
                            assignment.progress === 100 ? 'success' :
                            assignment.progress < 30 ? 'exception' :
                            'active'
                          }
                        />
                      ) : '-';
                    }
                  },
                  {
                    title: '最近活动',
                    key: 'lastActivity',
                    render: (_, record) => {
                      const assignment = learningPaths
                        .flatMap(p => p.assignments || [])
                        .find(a => a.studentId === record.id && a.status === 'active');
                      
                      return assignment && assignment.lastActivity ? 
                        moment(assignment.lastActivity).format('YYYY-MM-DD HH:mm') : 
                        '-';
                    }
                  },
                  {
                    title: '已完成路径',
                    key: 'completedPaths',
                    render: (_, record) => {
                      const completed = learningPaths
                        .flatMap(p => p.assignments || [])
                        .filter(a => a.studentId === record.id && a.status === 'completed')
                        .length;
                      
                      return completed;
                    }
                  },
                  {
                    title: '操作',
                    key: 'action',
                    render: (_, record) => (
                      <Button 
                        type="link" 
                        onClick={() => {
                          setSelectedStudent(record);
                          setStudentProgressVisible(true);
                        }}
                      >
                        详情
                      </Button>
                    )
                  }
                ]}
              />
            </Card>
          </Col>
          
          <Col span={8}>
            <Card title="学习路径完成情况">
              <List
                itemLayout="horizontal"
                dataSource={learningPaths.filter(p => p.assignments && p.assignments.length > 0)}
                renderItem={path => {
                  const totalAssignments = path.assignments.length;
                  const completedAssignments = path.assignments.filter(a => a.status === 'completed').length;
                  const completionRate = totalAssignments > 0 ? 
                    Math.round((completedAssignments / totalAssignments) * 100) : 
                    0;
                  
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<NodeIndexOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                        title={path.title}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">
                              分配学生: {totalAssignments} | 已完成: {completedAssignments}
                            </Text>
                            <Progress percent={completionRate} size="small" />
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </Card>
            
            <Card title="学习数据分析" style={{ marginTop: 16 }}>
              <Statistic 
                title="平均完成时间" 
                value={statistics.averageCompletionTime || 0} 
                suffix="天" 
                prefix={<ClockCircleOutlined />} 
                style={{ marginBottom: 16 }}
              />
              
              <Statistic 
                title="平均通过率" 
                value={statistics.averagePassRate || 0} 
                suffix="%" 
                prefix={<CheckCircleOutlined />} 
                style={{ marginBottom: 16 }}
              />
              
              <Statistic 
                title="困难节点数" 
                value={statistics.difficultNodes || 0} 
                prefix={<ExclamationCircleOutlined />} 
              />
              
              <Divider />
              
              <Title level={5}>学习路径效果</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic 
                    title="高效路径" 
                    value={statistics.effectivePaths || 0} 
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<RiseOutlined />} 
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="待优化路径" 
                    value={statistics.ineffectivePaths || 0} 
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<FallOutlined />} 
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Card
      title={
        <Space>
          <NodeIndexOutlined />
          <span>自适应学习路径</span>
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => setSettingsVisible(true)}
          >
            设置
          </Button>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <NodeIndexOutlined />
              路径构建器
            </span>
          } 
          key="pathBuilder"
        >
          {renderPathBuilderTab()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <BookOutlined />
              路径库
            </span>
          } 
          key="pathLibrary"
        >
          {renderPathLibraryTab()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              学生进度
            </span>
          } 
          key="studentProgress"
        >
          {renderStudentProgressTab()}
        </TabPane>
      </Tabs>
      
      {/* 节点编辑模态框 */}
      <Modal
        title="编辑节点"
        open={nodeModalVisible}
        onOk={handleNodeUpdate}
        onCancel={() => setNodeModalVisible(false)}
        width={700}
      >
        <Form form={nodeForm} layout="vertical">
          <Form.Item
            name="title"
            label="节点标题"
            rules={[{ required: true, message: '请输入节点标题' }]}
          >
            <Input placeholder="输入节点标题" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="节点类型"
            rules={[{ required: true, message: '请选择节点类型' }]}
          >
            <Select placeholder="选择节点类型">
              <Option value="content">学习内容</Option>
              <Option value="assessment">评估测验</Option>
              <Option value="resource">学习资源</Option>
              <Option value="activity">互动活动</Option>
              <Option value="milestone">里程碑</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="节点描述"
          >
            <TextArea rows={3} placeholder="输入节点描述" />
          </Form.Item>
          
          <Form.Item
            name="estimatedTime"
            label="预计完成时间（分钟）"
          >
            <Input type="number" placeholder="输入预计完成时间" />
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              const nodeType = getFieldValue('type');
              
              if (nodeType === 'content') {
                return (
                  <Form.Item
                    name="content"
                    label="学习内容"
                  >
                    <TextArea rows={6} placeholder="输入学习内容" />
                  </Form.Item>
                );
              }
              
              if (nodeType === 'assessment') {
                return (
                  <>
                    <Form.Item
                      name="assessmentId"
                      label="选择评估"
                    >
                      <Select placeholder="选择评估">
                        {assessments.map(assessment => (
                          <Option key={assessment.id} value={assessment.id}>
                            {assessment.title}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="requiredScore"
                      label="通过分数"
                    >
                      <Input type="number" placeholder="输入通过分数" />
                    </Form.Item>
                  </>
                );
              }
              
              if (nodeType === 'resource') {
                return (
                  <Form.Item
                    name="resourceId"
                    label="选择资源"
                  >
                    <Select placeholder="选择资源">
                      {resources.map(resource => (
                        <Option key={resource.id} value={resource.id}>
                          {resource.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 路径设置模态框 */}
      <Modal
        title="学习路径设置"
        open={pathModalVisible}
        onOk={handlePathSave}
        onCancel={() => setPathModalVisible(false)}
        width={700}
      >
        <Form form={pathForm} layout="vertical">
          <Form.Item
            name="title"
            label="路径标题"
            rules={[{ required: true, message: '请输入路径标题' }]}
          >
            <Input placeholder="输入路径标题" />
          </Form.Item>
          
          <Form.Item
            name="subject"
            label="学科"
            rules={[{ required: true, message: '请选择学科' }]}
          >
            <Select placeholder="选择学科">
              {subjects.map(subject => (
                <Option key={subject.id} value={subject.id}>{subject.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="路径描述"
          >
            <TextArea rows={4} placeholder="输入路径描述" />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select mode="tags" placeholder="添加标签">
              <Option value="初级">初级</Option>
              <Option value="中级">中级</Option>
              <Option value="高级">高级</Option>
              <Option value="复习">复习</Option>
              <Option value="拓展">拓展</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="isPublic"
            valuePropName="checked"
          >
            <Switch checkedChildren="公开" unCheckedChildren="私有" /> 
            <Text type="secondary" style={{ marginLeft: 8 }}>
              公开的学习路径可以被其他教师查看和使用
            </Text>
          </Form.Item>
          
          <Form.Item
            name="adaptiveRules"
            label="自适应规则"
          >
            <Collapse>
              <Panel header="设置自适应规则" key="1">
                <Form.Item
                  name="allowSkipping"
                  valuePropName="checked"
                >
                  <Checkbox>允许跳过节点</Checkbox>
                </Form.Item>
                
                <Form.Item
                  name="requirePrerequisites"
                  valuePropName="checked"
                >
                  <Checkbox>强制前置要求</Checkbox>
                </Form.Item>
                
                <Form.Item
                  name="adaptToPerformance"
                  valuePropName="checked"
                >
                  <Checkbox>根据表现调整难度</Checkbox>
                </Form.Item>
                
                <Form.Item
                  name="suggestAlternatives"
                  valuePropName="checked"
                >
                  <Checkbox>在困难时提供替代路径</Checkbox>
                </Form.Item>
              </Panel>
            </Collapse>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* AI生成模态框 */}
      <Modal
        title="AI生成学习路径"
        open={aiModalVisible}
        onOk={handleAiGenerate}
        onCancel={() => setAiModalVisible(false)}
        confirmLoading={aiGenerating}
        width={700}
      >
        <Form layout="vertical">
          <Form.Item
            label="学科"
            required
          >
            <Select placeholder="选择学科">
              {subjects.map(subject => (
                <Option key={subject.id} value={subject.id}>{subject.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="学习目标"
            required
          >
            <TextArea 
              rows={3} 
              placeholder="描述学习目标，例如：掌握分数加减法的基本运算"
            />
          </Form.Item>
          
          <Form.Item
            label="目标学生"
          >
            <Select placeholder="选择目标学生群体">
              <Option value="elementary">小学生</Option>
              <Option value="middle">初中生</Option>
              <Option value="high">高中生</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="路径复杂度"
          >
            <Slider 
              marks={{
                1: '简单',
                3: '中等',
                5: '复杂'
              }}
              min={1}
              max={5}
              defaultValue={3}
            />
          </Form.Item>
          
          <Form.Item
            label="生成提示"
          >
            <TextArea
              rows={6}
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="提供更多细节来指导AI生成学习路径，例如：包含互动练习、视频资源和小组活动，注重实际应用..."
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 预览模态框 */}
      <Modal
        title={`预览: ${selectedPath?.title || ''}`}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={900}
        bodyStyle={{ height: 600 }}
      >
        <div style={{ height: '100%' }}>
          <ReactFlow
            elements={pathElements}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onElementClick={(event, element) => {
              if (element.type !== 'smoothstep') {
                setSelectedNode(element);
              }
            }}
            zoomOnScroll={false}
            zoomOnPinch={true}
            panOnScroll={true}
            interactive={false}
          >
            <Controls />
            <Background />
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.type === 'input') return '#0041d0';
                if (n.type === 'output') return '#ff0072';
                if (n.type === 'default') return '#1a192b';
                return '#eee';
              }}
              nodeColor={(n) => {
                if (n.type === 'assessment') return '#ff0072';
                if (n.type === 'resource') return '#00d084';
                if (n.type === 'activity') return '#ffb800';
                if (n.type === 'milestone') return '#8338ec';
                return '#1a192b';
              }}
            />
          </ReactFlow>
        </div>
      </Modal>
      
      {/* 设置抽屉 */}
      <Drawer
        title="学习路径设置"
        placement="right"
        width={400}
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
      >
        <Form form={settingsForm} layout="vertical">
          {/* 设置表单内容 */}
        </Form>
      </Drawer>
      
      {/* 学生进度抽屉 */}
      <Drawer
        title={`${selectedStudent?.name || '学生'} 的学习进度`}
        placement="right"
        width={600}
        onClose={() => setStudentProgressVisible(false)}
        open={studentProgressVisible}
      >
        {selectedStudent && (
          <div>
            {/* 学生进度详情 */}
          </div>
        )}
      </Drawer>
    </Card>
  );
};

export default AdaptiveLearning; 