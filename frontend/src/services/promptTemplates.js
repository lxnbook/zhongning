/**
 * 提示词模板服务

 * 提供各种场景下的提示词模板

 */



// 学科相关提示词模板

const subjectTemplates = {

  // 语文学科模板

    chinese: {
    // 教案生成

    lessonPlan: {

      id: 'chinese_lesson_plan',

      name: '语文教案生成',

      description: '生成语文学科的详细教案',

      prompt: `请为{grade}语文课程设计一份关于"{topic}"的教案，教学目标是{goals}，课时为{duration}分钟。

      

请包含以下内容：

1. 教学目标（知识目标、能力目标、情感目标）

2. 教学重点和难点

3. 教学准备（教具、学具、多媒体资源等）

4. 教学过程（包括导入、新课讲授、巩固练习、总结）

5. 板书设计

6. 课后作业

7. 教学反思



请注意以下要点：

- 符合{grade}学生的认知特点和学习能力

- 注重语文学科的阅读理解、写作表达、文学鉴赏等核心素养培养

- 设计多样化的教学活动，激发学生学习兴趣

- 融入思政元素和传统文化内容`,

      parameters: ['grade', 'topic', 'goals', 'duration']

    },

    

    // 阅读理解题目生成

    readingComprehension: {

      id: 'chinese_reading_comprehension',

      name: '语文阅读理解题目生成',

      description: '根据文本生成阅读理解题目',

      prompt: `请根据以下{grade}语文{textType}文本，生成{questionCount}道阅读理解题目，难度为{difficulty}：



文本内容：

{text}



请生成的题目包括以下类型：

1. 理解文章主旨和中心思想的题目

2. 分析文章结构和写作手法的题目

3. 理解重要词句含义的题目

4. 分析人物形象或事件的题目

5. 联系实际、发表评价的题目



每道题目请给出参考答案和评分标准。`,

      parameters: ['grade', 'textType', 'text', 'questionCount', 'difficulty']

    },

    

    // 作文评改

    essayFeedback: {

      id: 'chinese_essay_feedback',

      name: '语文作文评改',

      description: '对学生作文进行评改和反馈',

      prompt: `请对以下{grade}学生的{essayType}作文进行专业评改和反馈：



作文题目：{title}

作文内容：

{content}



请从以下几个方面进行评价：

1. 内容与主题（切题程度、中心明确性、内容充实度）

2. 结构与布局（结构完整性、段落安排、过渡自然度）

3. 语言表达（用词准确性、句式多样性、语言生动性）

4. 思想深度（思想深刻度、创新性、情感真实性）

5. 书写与格式（标点符号、错别字等）



请给出具体的修改建议和改进方向，并给出总体评分（百分制）和评语。`,

      parameters: ['grade', 'essayType', 'title', 'content']

    }

  },

  

  // 数学学科模板

  math: {

    // 教案生成

    lessonPlan: {

      id: 'math_lesson_plan',

      name: '数学教案生成',

      description: '生成数学学科的详细教案',

      prompt: `请为{grade}数学课程设计一份关于"{topic}"的教案，教学目标是{goals}，课时为{duration}分钟。

      

请包含以下内容：

1. 教学目标（知识目标、能力目标、情感目标）

2. 教学重点和难点

3. 教学准备（教具、学具、多媒体资源等）

4. 教学过程（包括导入、新课讲授、例题讲解、巩固练习、总结）

5. 板书设计

6. 课后作业

7. 教学反思



请注意以下要点：

- 符合{grade}学生的认知特点和数学思维发展水平

- 注重数学核心素养的培养（数学抽象、逻辑推理、数学建模等）

- 设计多样化的教学活动，激发学生学习兴趣

- 注重数学概念的理解和数学思维方法的培养`,

      parameters: ['grade', 'topic', 'goals', 'duration']

    },

    

    // 数学试题生成

    mathProblems: {

      id: 'math_problems',

      name: '数学试题生成',

      description: '生成数学试题和详细解答',

      prompt: `请为{grade}数学{chapter}章节生成{count}道{difficulty}难度的数学题目，题型包括{problemTypes}。



每道题目请提供：

1. 题目内容

2. 详细的解题过程

3. 答案

4. 解题要点和易错点分析



请确保题目：

- 符合{grade}数学教学大纲要求

- 难度适中，具有区分度

- 涵盖该章节的重要知识点

- 题目表述清晰，数据合理`,

      parameters: ['grade', 'chapter', 'count', 'difficulty', 'problemTypes']

    },

    

    // 数学概念讲解

    mathConceptExplanation: {

      id: 'math_concept_explanation',

      name: '数学概念讲解',

      description: '生成数学概念的详细讲解',

      prompt: `请为{grade}学生详细讲解数学概念"{concept}"。



请包含以下内容：

1. 概念的定义和来源

2. 概念的直观理解和形象解释

3. 相关的数学公式和性质

4. 与其他数学概念的联系

5. 在实际生活中的应用例子

6. 3-5个由浅入深的例题及详细解答

7. 学习该概念的常见误区和解决方法



请使用通俗易懂的语言，结合图形、表格等方式进行解释，适合{grade}学生的认知水平。`,

      parameters: ['grade', 'concept']

    }

  },

  

  // 英语学科模板

  english: {

    // 教案生成

    lessonPlan: {

      id: 'english_lesson_plan',

      name: '英语教案生成',

      description: '生成英语学科的详细教案',

      prompt: `请为{grade}英语课程设计一份关于"{topic}"的教案，教学目标是{goals}，课时为{duration}分钟。

      

请包含以下内容：

1. 教学目标（语言知识、语言技能、情感态度）

2. 教学重点和难点

3. 教学准备（教具、学具、多媒体资源等）

4. 教学过程（包括Warm-up, Presentation, Practice, Production, Summary）

5. 板书设计

6. 课后作业

7. 教学反思



请注意以下要点：

- 符合{grade}学生的英语水平和认知特点

- 注重听说读写全面发展

- 采用任务型教学法或交际教学法

- 创设真实的语言环境和交际情境

- 适当融入文化背景知识`,

      parameters: ['grade', 'topic', 'goals', 'duration']

    },

    

    // 英语作文批改

    essayCorrection: {

      id: 'english_essay_correction',

      name: '英语作文批改',

      description: '对英语作文进行批改和反馈',

      prompt: `请对以下{grade}学生的英语{essayType}作文进行专业批改和反馈：



作文题目：{title}

作文内容：

{content}



请从以下几个方面进行评价：

1. 内容与主题（Content & Relevance）

2. 组织与结构（Organization & Coherence）

3. 语言准确性（Language Accuracy）：语法、词汇、拼写等

4. 语言多样性（Language Range）：词汇和句式的丰富程度

5. 语篇特征（Discourse Features）：连贯性、衔接手段等



请：

1. 标出文中的错误并给出修改建议

2. 提供改进的表达方式和更地道的表达

3. 给出总体评分（百分制）和评语

4. 提供2-3条具体的改进建议`,

      parameters: ['grade', 'essayType', 'title', 'content']

    },

    

    // 英语口语对话生成

    conversation: {

      id: 'english_conversation',

      name: '英语口语对话生成',

      description: '生成英语口语练习对话',

      prompt: `请为{grade}英语学生创建一段关于"{topic}"的英语对话，对话应该适合{scenario}场景，包含{speakerCount}名说话者。



对话要求：

1. 难度级别：{difficulty}

2. 对话长度：约{length}个交流回合

3. 包含{grade}学生应掌握的核心词汇和句型

4. 对话自然流畅，符合英语国家的文化习惯和表达方式



请提供：

1. 完整的对话内容（包含说话者标识）

2. 对话中的重点词汇和短语解释

3. 文化背景知识说明（如有必要）

4. 2-3个基于对话内容的口语练习问题`,

      parameters: ['grade', 'topic', 'scenario', 'speakerCount', 'difficulty', 'length']

    }

  }

};



// 部门相关提示词模板

const departmentTemplates = {

  // 教务处模板

  academic: {

    // 课程安排

    courseScheduling: {

      id: 'academic_course_scheduling',

      name: '课程安排优化',

      description: '优化学校课程安排',

      prompt: `请根据以下信息，为{schoolName}的{grade}年级设计一份优化的课程表安排方案：



学校基本信息：

- 班级数量：{classCount}个班

- 每班学生人数：约{studentCount}人

- 可用教室数量：{classroomCount}间

- 专用教室：{specialClassrooms}



教师资源：

{teacherResources}



课程要求：

{courseRequirements}



请提供：

1. 优化的课程表安排方案（每班每天的课程安排）

2. 教师任课安排

3. 教室使用安排

4. 优化思路和考虑的因素

5. 可能存在的问题和解决建议`,

      parameters: ['schoolName', 'grade', 'classCount', 'studentCount', 'classroomCount', 'specialClassrooms', 'teacherResources', 'courseRequirements']

    },

    

    // 教学质量评估

    teachingQualityEvaluation: {

      id: 'academic_teaching_quality',

      name: '教学质量评估',

      description: '生成教学质量评估报告',

      prompt: `请根据以下数据，为{schoolName}的{department}部门生成一份{semester}学期的教学质量评估报告：



基本数据：

{basicData}



学生成绩数据：

{performanceData}



教师教学数据：

{teachingData}



学生评教数据：

{feedbackData}



请在报告中包含：

1. 教学质量总体评价

2. 各学科/教师教学质量分析

3. 教学优势和特色

4. 存在的问题和不足

5. 改进建议和措施

6. 下学期教学质量提升目标`,

      parameters: ['schoolName', 'department', 'semester', 'basicData', 'performanceData', 'teachingData', 'feedbackData']

    }

  },

  

  // 教研室模板

  research: {

    // 教研活动设计

    researchActivityDesign: {

      id: 'research_activity_design',

      name: '教研活动设计',

      description: '设计教研活动方案',

      prompt: `请为{schoolName}的{subject}学科教研组设计一份关于"{topic}"的教研活动方案：



基本信息：

- 教研组成员：{memberCount}人

- 教研活动时间：{duration}分钟

- 教研活动目标：{goals}



请设计包含以下内容的教研活动方案：

1. 活动主题和目标

2. 活动流程和时间安排

3. 主要研讨内容和形式

4. 参与教师的任务分工

5. 预期成果和评价方式

6. 后续跟进措施



请确保活动设计：

- 聚焦教学实践中的关键问题

- 促进教师专业成长和教学能力提升

- 形式多样，注重教师参与和互动

- 有明确的成果导向`,

      parameters: ['schoolName', 'subject', 'topic', 'memberCount', 'duration', 'goals']

    },

    

    // 学科发展规划

    subjectDevelopmentPlan: {

      id: 'research_subject_development',

      name: '学科发展规划',

      description: '制定学科发展规划',

      prompt: `请为{schoolName}的{subject}学科制定一份{period}学科发展规划：



学科现状：

{currentSituation}



外部环境分析：

{externalAnalysis}



内部条件分析：

{internalAnalysis}



请在规划中包含：

1. 学科发展愿景和目标

2. 学科建设的指导思想和原则

3. 主要建设内容和措施

   - 课程建设

   - 教师队伍建设

   - 教学改革与创新

   - 教研活动开展

   - 评价机制改革

4. 分阶段实施计划

5. 保障措施

6. 预期成果和评估方式`,

      parameters: ['schoolName', 'subject', 'period', 'currentSituation', 'externalAnalysis', 'internalAnalysis']

    }

  }

};



// 功能相关提示词模板

const functionTemplates = {

  // 教案生成

  lessonPlanning: {

    // 通用教案

    generalLessonPlan: {

      id: 'general_lesson_plan',

      name: '通用教案生成',

      description: '生成通用格式的教案',

      prompt: `请为{subject}学科{grade}年级设计一份关于"{topic}"的教案，教学目标是{goals}，课时为{duration}分钟。

      

请包含以下内容：

1. 教学目标

   - 知识与技能

   - 过程与方法

   - 情感态度与价值观

2. 教学重点和难点

3. 教学准备

4. 教学过程

   - 导入新课

   - 新课讲授

   - 巩固练习

   - 小结作业

5. 板书设计

6. 教学反思



请注意根据{subject}学科特点和{grade}学生认知水平设计教学活动和内容。`,

      parameters: ['subject', 'grade', 'topic', 'goals', 'duration']

    },

    

    // 单元教学设计

    unitDesign: {

      id: 'unit_design',

      name: '单元教学设计',

      description: '生成完整的单元教学设计',

      prompt: `请为{subject}学科{grade}年级设计一份关于"{unitName}"的单元教学设计：



单元基本信息：

- 课时安排：{lessonCount}课时

- 学生情况：{studentInfo}

- 教材版本：{textbookVersion}



请包含以下内容：

1. 单元教学目标

2. 单元重难点分析

3. 单元教学策略

4. 各课时教学内容安排

5. 单元教学资源

6. 单元学习评价方案

7. 单元整体教学反思



请注意单元内各课时的内在联系和递进关系，体现学科核心素养的培养。`,

      parameters: ['subject', 'grade', 'unitName', 'lessonCount', 'studentInfo', 'textbookVersion']

    }

  },

  

  // 试题生成

  assessment: {

    // 试卷生成

    examPaper: {

      id: 'exam_paper',

      name: '试卷生成',

      description: '生成完整的考试试卷',

      prompt: `请为{subject}学科{grade}年级生成一份{examType}试卷，考试时间{duration}分钟，总分{totalScore}分。



考试范围：

{examScope}



题型要求：

{questionTypes}



请生成完整的试卷，包括：

1. 试卷标题和基本信息

2. 各题型的题目内容

3. 每道题的分值

4. 参考答案和评分标准



请确保试卷：

- 难度适中，区分度良好

- 覆盖考试范围的重要知识点

- 题目表述清晰，数据准确

- 符合{grade}学生的认知水平`,

      parameters: ['subject', 'grade', 'examType', 'duration', 'totalScore', 'examScope', 'questionTypes']

    },

    

    // 能力测评

    skillAssessment: {

      id: 'skill_assessment',

      name: '能力测评题目',

      description: '生成能力测评题目',

      prompt: `请为{subject}学科{grade}年级学生设计一套测评{skillType}能力的题目：



能力要素：

{skillElements}


学生情况：
{studentInfo}



请设计：

1. {questionCount}道不同类型、不同难度的题目

2. 每道题目的评分标准

3. 能力水平的分级描述

4. 测评结果分析与建议模板



请确保题目：

- 聚焦于{skillType}能力的测评

- 难度梯度合理

- 情境真实，贴近学生生活

- 有较好的区分度`,

      parameters: ['subject', 'grade', 'skillType', 'skillElements', 'studentInfo', 'questionCount']

    }

  },

  

  // 学生反馈

  feedback: {

    // 作业评语

    homeworkFeedback: {

      id: 'homework_feedback',

      name: '作业评语生成',

      description: '生成个性化作业评语',

      prompt: `请根据以下学生作业完成情况，生成{count}条个性化的评语：



学生信息：

- 年级：{grade}
- 学科：{subject}
- 作业类型：{homeworkType}



作业完成情况：

{completionStatus}



存在的问题：

{problems}



表现优秀的方面：

{strengths}



请生成：

1. 针对不同表现水平的学生的个性化评语

2. 评语应包含肯定成绩、指出不足、提出建议三个方面

3. 语言亲切鼓励，有针对性

4. 每条评语100-150字左右`,

      parameters: ['count', 'grade', 'subject', 'homeworkType', 'completionStatus', 'problems', 'strengths']

    },

    

    // 学习报告

    learningReport: {

      id: 'learning_report',

      name: '学习报告生成',

      description: '生成学生学习情况报告',

      prompt: `请根据以下学生的学习数据，生成一份{period}{subject}学科的学习情况报告：



学生基本信息：

{studentInfo}



学习表现数据：

{performanceData}



测验/考试成绩：

{testScores}



课堂表现：

{classroomPerformance}



请在报告中包含：

1. 学习情况总体评价

2. 知识掌握情况分析

3. 学习能力评估

4. 学习态度和习惯评价

5. 存在的问题和不足

6. 进步和优势

7. 有针对性的改进建议

8. 下阶段学习目标



报告语言应积极正面，客观公正，既指出问题又注重鼓励。`,

      parameters: ['period', 'subject', 'studentInfo', 'performanceData', 'testScores', 'classroomPerformance']

    }

  }

};



// 添加更多学科模板
const scienceTemplates = {
  physics: {
    // 物理学科模板
  },
  chemistry: {
    // 化学学科模板
  },
  biology: {
    // 生物学科模板
  }
};



// 导出所有模板

const allTemplates = {

  subjects: {

    ...subjectTemplates,

    ...scienceTemplates

  },

  departments: departmentTemplates,

  functions: functionTemplates

};



export default allTemplates;



// 辅助函数 - 获取特定类别的模板

export const getTemplatesByCategory = (category) => {

  return allTemplates[category] || {};

};



// 辅助函数 - 获取特定模板

export const getTemplateById = (templateId) => {

  // 遍历所有模板类别

  for (const category in allTemplates) {

    // 遍历类别中的子类别

    for (const subCategory in allTemplates[category]) {

      // 遍历子类别中的模板

      for (const templateKey in allTemplates[category][subCategory]) {

        const template = allTemplates[category][subCategory][templateKey];

        if (template.id === templateId) {

          return template;

        }

      }

    }

  }

  return null;

};



// 辅助函数 - 填充模板参数

export const fillTemplate = (template, parameters) => {

  if (!template || !template.prompt) {

    return '';

  }

  

  let filledPrompt = template.prompt;

  

  // 替换所有参数

  for (const key in parameters) {

    const regex = new RegExp(`{${key}}`, 'g');

    filledPrompt = filledPrompt.replace(regex, parameters[key]);

  }

  

  return filledPrompt;

};
